from django.urls import path
from .views import RoadmapListView, RoadmapDetailView, SkillNodeDetailView

urlpatterns = [
    path('', RoadmapListView.as_view(), name='roadmap-list'),
    path('<slug:slug>/', RoadmapDetailView.as_view(), name='roadmap-detail'),
    path('skill/<int:pk>/', SkillNodeDetailView.as_view(), name='skill-detail'),
]
