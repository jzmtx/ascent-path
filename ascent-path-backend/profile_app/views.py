from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UserSkill, UserCertification, UserProject, UserResume
from .serializers import (
    UserSkillSerializer, UserCertificationSerializer,
    UserProjectSerializer, UserResumeSerializer, OnboardingSerializer,
)
from core.ai_utils import get_gemini_model


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_onboarding(request):
    """Save the full onboarding wizard payload in one request."""
    serializer = OnboardingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    user = request.user
    level = data.get('level', 'beginner')

    # ── Profile & Socials ─────────────────────────────────────────────────────
    from roles.models import ResumeProfile
    profile, _ = ResumeProfile.objects.get_or_create(user=user)
    
    # Update User model if name provided
    full_name = data.get('full_name', '').strip()
    if full_name:
        parts = full_name.split(' ')
        user.first_name = parts[0]
        user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
        user.save()

    # Update ResumeProfile
    profile.phone = data.get('phone', profile.phone)
    profile.location = data.get('location', profile.location)
    profile.github_url = data.get('github_url', profile.github_url)
    profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
    profile.professional_summary = data.get('professional_summary', profile.professional_summary)
    profile.save()

    # Sync User's github/bio too
    if not user.github_url:
        user.github_url = data.get('github_url', '')
    if not user.bio:
        user.bio = data.get('professional_summary', '')
    user.save()

    # ── Skills ────────────────────────────────────────────────────────────────
    created_skills = []
    for skill_item in data.get('skills', []):
        skill_name = skill_item.get('name', '').strip()
        if not skill_name:
            continue
        obj, _ = UserSkill.objects.update_or_create(
            user=request.user, skill_name=skill_name,
            defaults={'self_reported_level': level},
        )
        created_skills.append(obj)

    # ── Certifications ────────────────────────────────────────────────────────
    for cert in data.get('certifications', []):
        if cert.get('name', '').strip():
            UserCertification.objects.get_or_create(
                user=request.user,
                name=cert['name'].strip(),
                defaults={
                    'issuer': cert.get('issuer', ''),
                    'year': cert.get('year', ''),
                    'credential_url': cert.get('credential_url', ''),
                },
            )

    # ── Projects ──────────────────────────────────────────────────────────────
    for proj in data.get('projects', []):
        if proj.get('title', '').strip():
            UserProject.objects.get_or_create(
                user=request.user,
                title=proj['title'].strip(),
                defaults={
                    'tech_stack': proj.get('tech', ''),
                    'github_url': proj.get('url', ''),
                    'description': proj.get('description', ''),
                },
            )

    return Response({
        'message': 'Onboarding data saved successfully.',
        'skills_saved': len(created_skills),
        'skills': UserSkillSerializer(created_skills, many=True).data,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_skills(request):
    skills = UserSkill.objects.filter(user=request.user)
    return Response(UserSkillSerializer(skills, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_profile(request):
    user = request.user
    skills = UserSkill.objects.filter(user=user)
    certs = UserCertification.objects.filter(user=user)
    projects = UserProject.objects.filter(user=user)
    try:
        resume = UserResumeSerializer(user.resume).data
    except Exception:
        resume = None

    return Response({
        'skills': UserSkillSerializer(skills, many=True).data,
        'certifications': UserCertificationSerializer(certs, many=True).data,
        'projects': UserProjectSerializer(projects, many=True).data,
        'resume': resume,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_resume(request):
    """Upload resume PDF — stores URL and parses with Gemini."""
    file = request.FILES.get('resume')
    if not file:
        return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

    allowed_types = ['application/pdf', 'application/msword',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if file.content_type not in allowed_types:
        return Response({'error': 'Only PDF and DOC files allowed.'}, status=status.HTTP_400_BAD_REQUEST)

    # For now store file content as text — Supabase Storage integration is Phase 3
    # Read raw bytes and attempt basic text extraction
    raw_content = file.read()
    
    # Try to parse PDF text using basic approach
    parsed_text = ''
    try:
        import io
        # Basic extraction — full Gemini parsing in production
        parsed_text = raw_content.decode('latin-1', errors='ignore')[:3000]
    except Exception:
        parsed_text = ''

    resume_obj, _ = UserResume.objects.update_or_create(
        user=request.user,
        defaults={
            'original_filename': file.name,
            'raw_text': parsed_text,
        }
    )

    # Parse with Gemini if text available
    if parsed_text:
        try:
            model = get_gemini_model('gemini-flash-latest')
            prompt = f"""Extract from this resume text and return ONLY valid JSON:
{{
  "skills": ["skill1", "skill2"],
  "experience": [{{"role": "", "company": "", "duration": ""}}],
  "summary": "2 sentence professional summary"
}}

Resume text:
{parsed_text[:2000]}"""
            response = model.generate_content(prompt)
            import json
            text = response.text.strip()
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
            parsed = json.loads(text.strip())
            resume_obj.parsed_skills = parsed.get('skills', [])
            resume_obj.parsed_experience = parsed.get('experience', [])
            resume_obj.gemini_summary = parsed.get('summary', '')
            resume_obj.save()
        except Exception as e:
            pass  # Continue even if Gemini fails

    return Response({
        'message': 'Resume uploaded successfully.',
        'resume': UserResumeSerializer(resume_obj).data,
    }, status=status.HTTP_201_CREATED)
