from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with Ascent Path profile fields."""
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    github_url = models.URLField(blank=True)
    target_role = models.CharField(max_length=100, blank=True)
    streak = models.PositiveIntegerField(default=0)
    consistency_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email
