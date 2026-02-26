from django.db import models
from users.models import User
from roadmaps.models import SkillNode, Roadmap


class UserProgress(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('learning', 'Learning'),
        ('assessed', 'Assessed'),
        ('project_done', 'Project Done'),
        ('verified', 'Verified'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    skill = models.ForeignKey(SkillNode, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    confidence_score = models.FloatField(default=0.0)  # 0.0 – 1.0
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_progress'
        unique_together = ('user', 'skill')

    def __str__(self):
        return f"{self.user.email} → {self.skill.title} [{self.status}]"


class RoadmapEnrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completion_pct = models.FloatField(default=0.0)

    class Meta:
        db_table = 'roadmap_enrollments'
        unique_together = ('user', 'roadmap')

    def __str__(self):
        return f"{self.user.email} enrolled in {self.roadmap.title}"
