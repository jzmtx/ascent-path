from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import UserProgress, RoadmapEnrollment
from .serializers import UserProgressSerializer, RoadmapEnrollmentSerializer
from roadmaps.models import Roadmap


class MyProgressView(generics.ListAPIView):
    """GET /api/progress/ — all skill progress for the current user"""
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user).select_related('skill', 'skill__roadmap')


class UpdateProgressView(APIView):
    """POST /api/progress/update/ — mark a skill as started/completed"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        skill_id = request.data.get('skill_id')
        new_status = request.data.get('status')

        if not skill_id or not new_status:
            return Response({'error': 'skill_id and status are required.'}, status=status.HTTP_400_BAD_REQUEST)

        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            skill_id=skill_id,
            defaults={'status': 'not_started'}
        )

        progress.status = new_status
        if new_status == 'learning' and not progress.started_at:
            progress.started_at = timezone.now()
        if new_status == 'verified':
            progress.completed_at = timezone.now()
            progress.confidence_score = request.data.get('confidence_score', 1.0)

        progress.save()

        # Update enrollment completion percentage
        self._update_enrollment_pct(request.user, progress.skill.roadmap)

        return Response(UserProgressSerializer(progress).data)

    def _update_enrollment_pct(self, user, roadmap):
        total = roadmap.skills.count()
        if total == 0:
            return
        done = UserProgress.objects.filter(
            user=user, skill__roadmap=roadmap, status='verified'
        ).count()
        enrollment = RoadmapEnrollment.objects.filter(user=user, roadmap=roadmap).first()
        if enrollment:
            enrollment.completion_pct = round((done / total) * 100, 1)
            enrollment.save()


class EnrollView(APIView):
    """POST /api/progress/enroll/ — enroll in a roadmap"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        roadmap_id = request.data.get('roadmap_id')
        try:
            roadmap = Roadmap.objects.get(id=roadmap_id, is_active=True)
        except Roadmap.DoesNotExist:
            return Response({'error': 'Roadmap not found.'}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = RoadmapEnrollment.objects.get_or_create(user=request.user, roadmap=roadmap)
        return Response(
            RoadmapEnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


class MyEnrollmentsView(generics.ListAPIView):
    """GET /api/progress/enrollments/ — all roadmaps the user is enrolled in"""
    serializer_class = RoadmapEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RoadmapEnrollment.objects.filter(user=self.request.user).select_related('roadmap')
