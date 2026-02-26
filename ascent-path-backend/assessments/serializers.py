from rest_framework import serializers
from .models import AssessmentQuestion, AssessmentSession, AssessmentAnswer


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'skill', 'level', 'question_text', 'code_snippet', 'options']
        # NOTE: correct_answer_index intentionally excluded from responses


class AssessmentSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentSession
        fields = ['id', 'skill', 'level', 'score', 'total_questions', 'correct_answers', 'tab_switches', 'status', 'started_at', 'completed_at']
        read_only_fields = ['score', 'correct_answers', 'started_at', 'completed_at']


class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.IntegerField(min_value=-1, max_value=3)


class SubmitAssessmentSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    answers = SubmitAnswerSerializer(many=True)
    tab_switches = serializers.IntegerField(default=0, min_value=0)
