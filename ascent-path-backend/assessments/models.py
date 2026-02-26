from django.db import models
from django.conf import settings


class AssessmentQuestion(models.Model):
    LEVEL_CHOICES = [('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]

    skill = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True)      # code block if applicable
    options = models.JSONField()                      # list of 4 strings
    correct_answer_index = models.IntegerField()      # 0-3
    explanation = models.TextField(blank=True)
    source = models.CharField(max_length=50, default='groq')  # groq / manual
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['skill', 'level']

    def __str__(self):
        return f"[{self.skill}/{self.level}] {self.question_text[:60]}"


class AssessmentSession(models.Model):
    STATUS_CHOICES = [('in_progress', 'In Progress'), ('completed', 'Completed'), ('abandoned', 'Abandoned')]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_sessions')
    skill = models.CharField(max_length=100)
    level = models.CharField(max_length=20)
    questions = models.ManyToManyField(AssessmentQuestion, blank=True)
    score = models.FloatField(null=True, blank=True)         # 0-100
    total_questions = models.IntegerField(default=10)
    correct_answers = models.IntegerField(default=0)
    tab_switches = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.user.username} — {self.skill} ({self.score}%)"


class AssessmentAnswer(models.Model):
    session = models.ForeignKey(AssessmentSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    selected_option = models.IntegerField()   # 0-3, -1 if skipped
    is_correct = models.BooleanField()
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.session_id} — Q{self.question_id} — {'✓' if self.is_correct else '✗'}"
