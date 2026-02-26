from rest_framework import serializers
from .models import Roadmap, SkillNode


class SkillNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillNode
        fields = '__all__'


class RoadmapSerializer(serializers.ModelSerializer):
    skills = SkillNodeSerializer(many=True, read_only=True)
    skill_count = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = ('id', 'title', 'slug', 'description', 'target_role',
                  'difficulty', 'estimated_weeks', 'skill_count', 'skills', 'created_at')

    def get_skill_count(self, obj):
        return obj.skills.count()


class RoadmapListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing roadmaps (no nested skills)."""
    class Meta:
        model = Roadmap
        fields = ('id', 'title', 'slug', 'target_role', 'difficulty',
                  'estimated_weeks', 'skill_count', 'created_at')
