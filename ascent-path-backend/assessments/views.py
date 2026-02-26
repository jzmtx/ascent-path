import json
import random
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decouple import config

from .models import AssessmentQuestion, AssessmentSession, AssessmentAnswer
from .serializers import (
    AssessmentQuestionSerializer, AssessmentSessionSerializer,
    SubmitAssessmentSerializer,
)
from profile_app.models import UserSkill

# ── Groq client (lazy init) ───────────────────────────────────────────────────

def get_groq_client():
    from groq import Groq
    return Groq(api_key=config('GROQ_API_KEY'))


def generate_questions_via_groq(skill: str, level: str, count: int = 5) -> list:
    """Call Groq Llama3-70B to generate MCQ questions. Returns list of question dicts."""
    client = get_groq_client()

    prompt = f"""Generate exactly {count} multiple-choice questions for a developer skill assessment.
Skill: {skill}
Level: {level}

Return ONLY a valid JSON array (no markdown, no extra text) in this exact format:
[
  {{
    "question": "Question text here",
    "code": "optional code snippet (empty string if none)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0,
    "explanation": "Brief explanation of why the answer is correct"
  }}
]

Rules:
- Questions must be practical and test real knowledge, not trivia
- Beginner: syntax, basic concepts
- Intermediate: patterns, debugging, real-world scenarios  
- Advanced: performance, architecture, edge cases
- All code snippets must be valid {skill} code
- correct_index is 0-3 matching the options array"""

    response = client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.7,
        max_tokens=2000,
    )

    raw = response.choices[0].message.content.strip()
    # Strip markdown code fences if present
    if raw.startswith('```'):
        lines = raw.split('\n')
        raw = '\n'.join(lines[1:-1] if lines[-1] == '```' else lines[1:])

    questions_data = json.loads(raw)
    return questions_data


# ── Fallback Questions ────────────────────────────────────────────────────────

FALLBACK_QUESTIONS = {
    'html': [
        {
            "question": "Which HTML element is used for the largest heading?",
            "options": ["<head>", "<h6>", "<h1>", "<heading>"],
            "correct_index": 2,
            "explanation": "<h1> is the standard tag for the most important, top-level heading."
        },
        {
            "question": "What is the correct HTML for creating a hyperlink?",
            "options": ["<a>http://google.com</a>", "<a href='http://google.com'>Google</a>", "<a name='http://google.com'>Google</a>", "<a>Google</a>"],
            "correct_index": 1,
            "explanation": "The <a> tag with the 'href' attribute is used to create links."
        }
    ],
    'javascript': [
        {
            "question": "Which keyword is used to declare a block-scoped variable that can be reassigned?",
            "options": ["var", "const", "let", "static"],
            "correct_index": 2,
            "explanation": "'let' allows reassignment and is block-scoped."
        }
    ]
}

def get_or_create_questions(skill: str, level: str, count: int = 10) -> list:
    """Get questions from DB cache. Generate via Groq if not enough."""
    skill_key = skill.lower().strip()
    existing = list(AssessmentQuestion.objects.filter(skill__iexact=skill, level=level))

    if len(existing) >= count:
        return random.sample(existing, count)

    # Need more — generate via Groq
    needed = max(count - len(existing), 5) 
    try:
        new_qs = generate_questions_via_groq(skill, level, needed)
        for q_data in new_qs:
            obj = AssessmentQuestion.objects.create(
                skill=skill,
                level=level,
                question_text=q_data['question'],
                code_snippet=q_data.get('code', ''),
                options=q_data['options'],
                correct_answer_index=q_data['correct_index'],
                explanation=q_data.get('explanation', ''),
                source='groq',
            )
            existing.append(obj)
    except Exception as e:
        print(f"Groq generation failed for {skill}: {str(e)}")
        # Fallback to hardcoded questions if DB is still empty
        if not existing:
            fallbacks = FALLBACK_QUESTIONS.get(skill_key, FALLBACK_QUESTIONS.get('javascript'))
            for q_data in fallbacks:
                obj = AssessmentQuestion.objects.create(
                    skill=skill,
                    level=level,
                    question_text=q_data['question'],
                    code_snippet=q_data.get('code', ''),
                    options=q_data['options'],
                    correct_answer_index=q_data['correct_index'],
                    explanation=q_data.get('explanation', ''),
                    source='fallback',
                )
                existing.append(obj)

    random.shuffle(existing)
    return existing[:count]


# ── API Views ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_assessment(request):
    """
    Generate an assessment session for a skill.
    Body: { "skill": "JavaScript", "level": "intermediate" }
    Returns session_id + questions (without answers).
    """
    skill = request.data.get('skill', '').strip()
    level = request.data.get('level', 'beginner').lower().strip()

    if not skill:
        return Response({'error': 'skill is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if level not in ['beginner', 'intermediate', 'advanced']:
        level = 'beginner'

    # Create session
    session = AssessmentSession.objects.create(
        user=request.user,
        skill=skill,
        level=level,
        total_questions=10,
    )

    # Fetch/generate questions
    questions = get_or_create_questions(skill, level, 10)
    session.questions.set(questions)
    session.save()

    return Response({
        'session_id': session.id,
        'skill': skill,
        'level': level,
        'questions': AssessmentQuestionSerializer(questions, many=True).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assessment(request):
    """
    Submit answers and get score.
    Body: { "session_id": 1, "answers": [{"question_id": 1, "selected_option": 2}], "tab_switches": 0 }
    """
    serializer = SubmitAssessmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    try:
        session = AssessmentSession.objects.get(id=data['session_id'], user=request.user)
    except AssessmentSession.DoesNotExist:
        return Response({'error': 'Session not found.'}, status=status.HTTP_404_NOT_FOUND)

    if session.status == 'completed':
        return Response({'error': 'Assessment already submitted.'}, status=status.HTTP_400_BAD_REQUEST)

    # Score answers
    correct = 0
    total = 0
    result_details = []

    total_questions = session.total_questions or len(data['answers'])

    for answer_data in data['answers']:
        try:
            question = AssessmentQuestion.objects.get(id=answer_data['question_id'])
        except AssessmentQuestion.DoesNotExist:
            continue

        is_correct = (answer_data['selected_option'] == question.correct_answer_index)
        # Count correct — skipped (-1) are always wrong
        if is_correct:
            correct += 1

        AssessmentAnswer.objects.create(
            session=session,
            question=question,
            selected_option=answer_data['selected_option'],
            is_correct=is_correct,
        )
        result_details.append({
            'question_id': question.id,
            'question': question.question_text,
            'your_answer': question.options[answer_data['selected_option']] if answer_data['selected_option'] >= 0 else 'Skipped',
            'correct_answer': question.options[question.correct_answer_index],
            'is_correct': is_correct,
            'explanation': question.explanation,
        })

    # Score out of TOTAL questions (not answered) — skipped = 0 marks
    score = round((correct / max(total_questions, 1)) * 100, 1)

    # Map score → verified skill level
    if score >= 71:
        verified_level = 'advanced'
    elif score >= 41:
        verified_level = 'intermediate'
    else:
        verified_level = 'beginner'

    tab_violation = data.get('tab_switches', 0) >= 3

    # Update session
    session.score = score
    session.correct_answers = correct
    session.tab_switches = data.get('tab_switches', 0)
    session.status = 'completed'
    session.completed_at = timezone.now()
    session.save()

    # Update UserSkill — verified score + auto-corrected skill level
    updated = UserSkill.objects.filter(
        user=request.user, skill_name__iexact=session.skill
    ).update(
        verified_score=score,
        is_verified=True,
        self_reported_level=verified_level,
    )
    # If UserSkill didn't exist yet, create it
    if not updated:
        UserSkill.objects.create(
            user=request.user,
            skill_name=session.skill,
            verified_score=score,
            is_verified=True,
            self_reported_level=verified_level,
        )

    return Response({
        'session_id': session.id,
        'skill': session.skill,
        'score': score,
        'correct': correct,
        'total': total,
        'tab_switches': session.tab_switches,
        'tab_violation': tab_violation,
        'passed': score >= 60,
        'level_awarded': verified_level,
        'details': result_details,
    })



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_assessment_history(request):
    sessions = AssessmentSession.objects.filter(user=request.user, status='completed')
    return Response(AssessmentSessionSerializer(sessions, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def session_result(request, session_id):
    try:
        session = AssessmentSession.objects.get(id=session_id, user=request.user)
    except AssessmentSession.DoesNotExist:
        return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
    return Response(AssessmentSessionSerializer(session).data)
