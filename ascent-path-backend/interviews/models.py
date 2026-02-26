from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class InterviewSession(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interview_sessions')
    skill = models.CharField(max_length=100)
    github_url = models.URLField(blank=True)
    resume_summary = models.TextField(blank=True)  # Parsed from their resume

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    score = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(default=False)

    total_questions = models.IntegerField(default=7)
    current_question = models.IntegerField(default=0)

    # Gemini gathers context about the user's actual code
    repo_context = models.TextField(blank=True)   # What Gemini found in their GitHub
    interview_plan = models.TextField(blank=True)  # The 7 questions Gemini prepared

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} — {self.skill} interview ({self.status})"


class InterviewMessage(models.Model):
    ROLE_CHOICES = [('ai', 'AI'), ('user', 'User')]

    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    question_number = models.IntegerField(null=True, blank=True)  # Which Q this belongs to
    score = models.FloatField(null=True, blank=True)              # Score for this answer (0-10)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
