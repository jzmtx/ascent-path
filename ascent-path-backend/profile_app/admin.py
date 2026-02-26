from django.contrib import admin
from .models import UserSkill, UserCertification, UserProject, UserResume

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill_name', 'self_reported_level', 'is_verified', 'verified_score']
    list_filter = ['is_verified', 'self_reported_level']
    search_fields = ['user__email', 'skill_name']

@admin.register(UserCertification)
class UserCertificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'issuer', 'year']
    search_fields = ['user__email', 'name']

@admin.register(UserProject)
class UserProjectAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'tech_stack']
    search_fields = ['user__email', 'title']

@admin.register(UserResume)
class UserResumeAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_filename', 'uploaded_at']
