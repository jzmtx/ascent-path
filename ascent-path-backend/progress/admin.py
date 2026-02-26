from django.contrib import admin
from .models import UserProgress, RoadmapEnrollment

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'status', 'confidence_score', 'completed_at']
    list_filter = ['status']
    search_fields = ['user__email', 'skill__title']

@admin.register(RoadmapEnrollment)
class RoadmapEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap', 'completion_pct', 'enrolled_at']
    list_filter = ['roadmap']
    search_fields = ['user__email', 'roadmap__title']
