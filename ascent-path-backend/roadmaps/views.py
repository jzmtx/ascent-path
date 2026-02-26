from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Roadmap, SkillNode
from .serializers import RoadmapSerializer, RoadmapListSerializer, SkillNodeSerializer


class RoadmapListView(generics.ListAPIView):
    """GET /api/roadmaps/ — list all active roadmaps"""
    queryset = Roadmap.objects.filter(is_active=True)
    serializer_class = RoadmapListSerializer
    permission_classes = [permissions.AllowAny]


class RoadmapDetailView(generics.RetrieveAPIView):
    """GET /api/roadmaps/<slug>/ — full roadmap with skill nodes"""
    queryset = Roadmap.objects.filter(is_active=True)
    serializer_class = RoadmapSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class SkillNodeDetailView(generics.RetrieveAPIView):
    """GET /api/roadmaps/skill/<pk>/ — single skill node detail"""
    queryset = SkillNode.objects.all()
    serializer_class = SkillNodeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
