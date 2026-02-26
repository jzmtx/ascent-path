from rest_framework import serializers
from .models import UserSkill, UserCertification, UserProject, UserResume


class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSkill
        fields = ['id', 'skill_name', 'self_reported_level', 'verified_score', 'is_verified', 'added_at']
        read_only_fields = ['verified_score', 'is_verified', 'added_at']


class UserCertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCertification
        fields = ['id', 'name', 'issuer', 'year', 'credential_url', 'added_at']
        read_only_fields = ['added_at']


class UserProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProject
        fields = ['id', 'title', 'description', 'tech_stack', 'github_url', 'live_url', 'added_at']
        read_only_fields = ['added_at']


class UserResumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserResume
        fields = ['id', 'file_url', 'original_filename', 'parsed_skills', 'parsed_experience', 'gemini_summary', 'uploaded_at']
        read_only_fields = ['parsed_skills', 'parsed_experience', 'gemini_summary', 'uploaded_at']


class OnboardingSerializer(serializers.Serializer):
    """Accepts the full onboarding payload in one shot."""
    # Profile & Contact
    full_name = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)
    github_url = serializers.URLField(required=False, allow_blank=True)
    linkedin_url = serializers.URLField(required=False, allow_blank=True)
    professional_summary = serializers.CharField(required=False, allow_blank=True)

    # Skills & Level
    skills = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    level = serializers.ChoiceField(choices=['beginner', 'intermediate', 'advanced'], default='beginner')
    
    # Career History
    certifications = serializers.ListField(child=serializers.DictField(), required=False, default=list)
    projects = serializers.ListField(child=serializers.DictField(), required=False, default=list)
