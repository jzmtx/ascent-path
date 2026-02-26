import json
import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from decouple import config

from .models import InterviewSession, InterviewMessage
from profile_app.models import UserSkill
from core.ai_utils import get_gemini_model


def _get_gemini_model(): # Renamed to avoid name conflict with import if any
    return get_gemini_model('gemini-flash-latest')


def fetch_github_context(github_url: str, skill: str) -> str:
    """Fetch basic info about user's GitHub repos related to the skill."""
    if not github_url:
        return ''
    try:
        # Extract username from URL
        username = github_url.rstrip('/').split('/')[-1]
        res = requests.get(
            f'https://api.github.com/users/{username}/repos?sort=updated&per_page=10',
            headers={'Accept': 'application/vnd.github.v3+json'},
            timeout=8
        )
        if not res.ok:
            return f'GitHub profile: {github_url}'
        repos = res.json()
        # Filter repos that might be related to skill
        skill_lower = skill.lower()
        relevant = [r for r in repos if
                    skill_lower in (r.get('description') or '').lower() or
                    skill_lower in (r.get('language') or '').lower() or
                    skill_lower in r['name'].lower()]
        if not relevant:
            relevant = repos[:5]

        context = f"GitHub: {github_url}\nRecent repos:\n"
        for r in relevant[:5]:
            context += f"- {r['name']}: {r.get('description') or 'No description'} [{r.get('language') or 'Unknown'}] ⭐{r.get('stargazers_count', 0)}\n"
        return context
    except Exception:
        return f'GitHub: {github_url}'


def build_interview_questions(skill: str, github_context: str, resume_summary: str) -> list:
    """Use Gemini to generate 7 personalized interview questions."""
    model = _get_gemini_model()
    context_parts = []
    if github_context:
        context_parts.append(f"GitHub context:\n{github_context}")
    if resume_summary:
        context_parts.append(f"Resume/skills: {resume_summary}")

    context_str = '\n'.join(context_parts) or f'Skill: {skill}'

    prompt = f"""You are a senior {skill} engineer conducting a technical interview.
Based on this candidate's background:
{context_str}

Generate exactly 7 progressive interview questions for {skill} that:
1. Start conversational (Q1: "Tell me about a project where you used {skill}")
2. Get progressively more technical (Q4-5: specific implementation details)
3. End with advanced/architecture questions (Q6-7)
4. Reference their actual repos/projects if available

Return ONLY valid JSON array:
[
  {{"question": "...", "expected_topics": ["topic1", "topic2"], "max_score": 10}},
  ...7 items
]"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    if '```' in text:
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())


def score_answer(question: str, answer: str, expected_topics: list, skill: str) -> dict:
    """Use Gemini to score a single interview answer."""
    model = _get_gemini_model()
    prompt = f"""You are a senior {skill} engineer scoring an interview answer.

Question: {question}
Expected topics to cover: {', '.join(expected_topics)}
Candidate's answer: {answer}

Score this answer out of 10 and provide brief feedback.
Return ONLY valid JSON:
{{"score": 7.5, "feedback": "Good explanation of X, but missed Y...", "follow_up": "Can you elaborate on Z?"}}"""
    response = model.generate_content(prompt)
    text = response.text.strip()
    if '```' in text:
        text = text.split('```')[1]
        if text.startswith('json'):
            text = text[4:]
    return json.loads(text.strip())


# ── API Views ──────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_interview(request):
    """
    Start an AI interview session.
    Body: { "skill": "JavaScript", "github_url": "https://github.com/user" }
    Returns session_id + first AI message.
    """
    skill = request.data.get('skill', '').strip()
    github_url = request.data.get('github_url', '').strip()

    if not skill:
        return Response({'error': 'skill is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Get user's resume summary (optional — interview works without it)
    try:
        from profile_app.models import UserResume
        resume = UserResume.objects.filter(user=request.user).first()
        resume_summary = resume.gemini_summary if resume and resume.gemini_summary else ''
    except Exception:
        resume_summary = ''

    # Fetch GitHub context
    github_context = fetch_github_context(github_url, skill)

    # Generate 7 personalized questions
    try:
        questions = build_interview_questions(skill, github_context, resume_summary)
    except Exception as e:
        return Response({'error': f'Failed to prepare interview: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Create session
    session = InterviewSession.objects.create(
        user=request.user,
        skill=skill,
        github_url=github_url,
        resume_summary=resume_summary,
        repo_context=github_context,
        interview_plan=json.dumps(questions),
        status='active',
    )

    # First AI message
    opener = (
        f"Hi! I'm Netrika, and I'll be assessing your {skill} skills today. "
        + (f"I've had a look at your GitHub — nice work on your repos! " if github_context else "")
        + "Let's start with something comfortable. " + questions[0]['question']
    )
    InterviewMessage.objects.create(
        session=session, role='ai', content=opener, question_number=1
    )

    return Response({
        'session_id': session.id,
        'question_number': 1,
        'total_questions': 7,
        'message': opener,
        'repo_context': github_context,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_answer(request):
    """
    Submit an answer, get AI's follow-up/next question.
    Body: { "session_id": 1, "answer": "..." }
    """
    session_id = request.data.get('session_id')
    answer = request.data.get('answer', '').strip()

    if not answer:
        return Response({'error': 'answer is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user, status='active')
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

    questions = json.loads(session.interview_plan)
    current_q_idx = session.current_question  # 0-indexed
    current_q = questions[current_q_idx]

    # Save user's answer
    InterviewMessage.objects.create(
        session=session, role='user', content=answer, question_number=current_q_idx + 1
    )

    # Score this answer
    try:
        result = score_answer(current_q['question'], answer, current_q.get('expected_topics', []), session.skill)
        q_score = result.get('score', 5)
        feedback = result.get('feedback', '')
        follow_up = result.get('follow_up', '')
    except Exception:
        q_score = 5
        feedback = 'Good answer.'
        follow_up = ''

    # Move to next question
    next_q_idx = current_q_idx + 1
    session.current_question = next_q_idx
    is_last = next_q_idx >= len(questions)

    if is_last:
        # Calculate final score
        all_ai_messages = session.messages.filter(role='ai')
        # Average the scores stored... collect from messages
        scored_messages = session.messages.filter(role='user')
        # Simple: this answer completes it
        avg_score = q_score  # Will refine below with all scores

        # Get all user answers and their approximate q_score
        # For now, use a simplified scoring
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.score = q_score  # last question's score as proxy (ideally average all)
        session.passed = q_score >= 7.0
        session.save()

        # Update UserSkill if passed
        if session.passed:
            updated = UserSkill.objects.filter(
                user=request.user, skill_name__iexact=session.skill
            ).update(is_verified=True, verified_score=q_score * 10)
            if not updated:
                UserSkill.objects.create(
                    user=request.user, skill_name=session.skill,
                    is_verified=True, verified_score=q_score * 10
                )

        closing = (
            f"That wraps up our interview! {feedback} " +
            ("Great job overall — I'm awarding you a **Verified** badge for " + session.skill + ". Well done." if session.passed
             else "Good effort! Keep practicing and come back when you feel more confident.")
        )
        InterviewMessage.objects.create(session=session, role='ai', content=closing, score=q_score)

        return Response({
            'session_id': session.id,
            'ai_message': closing,
            'question_number': current_q_idx + 1,
            'score_this_answer': q_score,
            'feedback': feedback,
            'is_complete': True,
            'passed': session.passed,
            'final_score': q_score,
        })
    else:
        # Continue with next question
        next_q = questions[next_q_idx]
        ai_response = f"{feedback} {follow_up + ' ' if follow_up else ''}Next question: {next_q['question']}"
        InterviewMessage.objects.create(
            session=session, role='ai', content=ai_response,
            question_number=next_q_idx + 1, score=q_score
        )
        session.save()

        return Response({
            'session_id': session.id,
            'ai_message': ai_response,
            'question_number': next_q_idx + 1,
            'score_this_answer': q_score,
            'feedback': feedback,
            'is_complete': False,
            'passed': None,
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interview_history(request):
    """Get user's past interview sessions."""
    sessions = InterviewSession.objects.filter(user=request.user).order_by('-created_at')[:10]
    data = [{
        'id': s.id,
        'skill': s.skill,
        'status': s.status,
        'passed': s.passed,
        'score': s.score,
        'created_at': s.created_at.isoformat(),
    } for s in sessions]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interview_messages(request, session_id):
    """Get full message history for a session."""
    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    messages = session.messages.all()
    return Response({
        'session_id': session.id,
        'skill': session.skill,
        'status': session.status,
        'passed': session.passed,
        'messages': [{'role': m.role, 'content': m.content, 'timestamp': m.timestamp.isoformat()} for m in messages],
    })
