from django.contrib import admin
from .models import Roadmap, SkillNode, Enrollment, ResumeProfile

@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'is_custom', 'created_at']
    search_fields = ['title', 'slug']

@admin.register(SkillNode)
class SkillNodeAdmin(admin.ModelAdmin):
    list_display = ['title', 'roadmap', 'difficulty', 'order']
    list_filter = ['roadmap', 'difficulty']

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'roadmap', 'current_tier', 'started_at']
    list_filter = ['current_tier']

@admin.register(ResumeProfile)
class ResumeProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'location', 'updated_at']
    search_fields = ['user__email', 'user__username']
