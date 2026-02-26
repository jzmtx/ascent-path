from django.db import models


class Roadmap(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    target_role = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    estimated_weeks = models.PositiveIntegerField(default=8)
    skill_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roadmaps'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class SkillNode(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, related_name='skills')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    order = models.PositiveIntegerField(default=0)
    # Prerequisites: comma-separated skill node ids
    prerequisites = models.JSONField(default=list, blank=True)
    mdn_url = models.URLField(blank=True)
    estimated_days = models.PositiveIntegerField(default=7)
    is_gateway = models.BooleanField(default=False)  # Unlocks next level
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'skill_nodes'
        ordering = ['order']

    def __str__(self):
        return f"{self.roadmap.title} → {self.title}"
