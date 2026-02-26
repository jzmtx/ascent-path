from django.db import models
from django.conf import settings


class UserSkill(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    self_reported_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    verified_score = models.FloatField(null=True, blank=True)  # 0-100, set after assessment
    is_verified = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'skill_name')
        ordering = ['-verified_score', 'skill_name']

    def __str__(self):
        return f"{self.user.username} — {self.skill_name} ({self.self_reported_level})"


class UserCertification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    year = models.CharField(max_length=10, blank=True)
    credential_url = models.URLField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} — {self.issuer} ({self.user.username})"


class UserProject(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='projects')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    tech_stack = models.CharField(max_length=500)  # comma-separated
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"


class UserResume(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resume')
    file_url = models.URLField(blank=True)          # Supabase Storage URL
    original_filename = models.CharField(max_length=255, blank=True)
    parsed_skills = models.JSONField(default=list)   # extracted skill names
    parsed_experience = models.JSONField(default=list)
    raw_text = models.TextField(blank=True)          # full extracted text for AI
    gemini_summary = models.TextField(blank=True)    # AI-generated summary
    uploaded_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Resume — {self.user.username}"
