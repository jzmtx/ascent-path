from django.urls import path
from . import views

urlpatterns = [
    path('trending/', views.trending_roles, name='trending-roles'),
    path('search/', views.search_roles, name='search-roles'),
    path('analyze-jd/', views.analyze_jd, name='analyze-jd'),
    path('enroll/', views.enroll_role, name='enroll-role'),
    path('roadmaps/', views.all_roadmaps, name='all-roadmaps'),
    path('roadmaps/<slug:slug>/', views.roadmap_detail, name='roadmap-detail'),
    path('complete-node/', views.complete_node, name='complete-node'),
    path('mentor/', views.mentor_chat, name='mentor-chat'),
    path('generate-resume/', views.generate_resume_view, name='generate-resume'),
    path('resume-profile/', views.resume_profile_view, name='resume-profile'),
    path('dashboard-stats/', views.dashboard_stats, name='dashboard-stats'),
    path('resume-analytics/', views.resume_analytics, name='resume-analytics'),
    
    # Keep this generic slug route at the very bottom!
    path('<slug:slug>/', views.role_detail, name='role-detail'),
]
