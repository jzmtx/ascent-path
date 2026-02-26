from rest_framework import serializers
from .models import Roadmap, SkillNode, RoleAnalysis, ResumeProfile


class SkillNodeSerializer(serializers.ModelSerializer):
    is_completed = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = SkillNode
        fields = [
            'id', 'title', 'description', 'resource_url', 'video_url', 
            'paid_course_url', 'project_description', 'difficulty', 
            'order', 'estimated_days', 'is_required', 'is_completed'
        ]


class RoadmapListSerializer(serializers.ModelSerializer):
    node_count = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = ['id', 'slug', 'title', 'description', 'icon', 'color', 'category', 'estimated_months', 'job_tags', 'node_count']

    def get_node_count(self, obj):
        return obj.nodes.count()


class RoadmapDetailSerializer(serializers.ModelSerializer):
    nodes = SkillNodeSerializer(many=True, read_only=True)
    current_tier = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()

    class Meta:
        model = Roadmap
        fields = [
            'id', 'slug', 'title', 'description', 'icon', 'color', 
            'category', 'estimated_months', 'job_tags', 'nodes', 
            'current_tier', 'is_enrolled'
        ]

    def get_current_tier(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated:
            from .models import Enrollment
            enrollment = Enrollment.objects.filter(user=user, roadmap=obj).first()
            return enrollment.current_tier if enrollment else 'beginner'
        return 'beginner'

    def get_is_enrolled(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and user.is_authenticated:
            from .models import Enrollment
            return Enrollment.objects.filter(user=user, roadmap=obj).exists()
        return False


class RoleAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoleAnalysis
        fields = ['role_slug', 'role_title', 'salary_range', 'demand_level', 'live_job_count', 'must_have_skills', 'nice_to_have_skills', 'interview_topics', 'industry_description', 'cached_at']


class ResumeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeProfile
        fields = ['phone', 'location', 'linkedin_url', 'github_url', 'portfolio_url', 'professional_summary']
