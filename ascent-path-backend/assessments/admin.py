from django.contrib import admin
from .models import AssessmentQuestion, AssessmentSession, AssessmentAnswer

@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ['skill', 'level', 'question_text', 'source']
    list_filter = ['skill', 'level', 'source']
    search_fields = ['question_text']

@admin.register(AssessmentSession)
class AssessmentSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'level', 'score', 'status', 'started_at']
    list_filter = ['status', 'level']
    search_fields = ['user__username', 'skill']

@admin.register(AssessmentAnswer)
class AssessmentAnswerAdmin(admin.ModelAdmin):
    list_display = ['session', 'question', 'is_correct']
    list_filter = ['is_correct']
