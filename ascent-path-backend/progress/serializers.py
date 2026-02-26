from rest_framework import serializers
from .models import UserProgress, RoadmapEnrollment


class UserProgressSerializer(serializers.ModelSerializer):
    skill_title = serializers.CharField(source='skill.title', read_only=True)
    roadmap_title = serializers.CharField(source='skill.roadmap.title', read_only=True)

    class Meta:
        model = UserProgress
        fields = ('id', 'skill', 'skill_title', 'roadmap_title', 'status',
                  'confidence_score', 'started_at', 'completed_at', 'updated_at')
        read_only_fields = ('updated_at',)


class RoadmapEnrollmentSerializer(serializers.ModelSerializer):
    roadmap_title = serializers.CharField(source='roadmap.title', read_only=True)
    roadmap_slug = serializers.CharField(source='roadmap.slug', read_only=True)

    class Meta:
        model = RoadmapEnrollment
        fields = ('id', 'roadmap', 'roadmap_title', 'roadmap_slug',
                  'enrolled_at', 'completion_pct')
        read_only_fields = ('enrolled_at', 'completion_pct')
