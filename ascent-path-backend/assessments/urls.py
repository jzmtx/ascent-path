from django.urls import path
from . import views

urlpatterns = [
    path('generate/', views.generate_assessment, name='generate-assessment'),
    path('submit/', views.submit_assessment, name='submit-assessment'),
    path('history/', views.my_assessment_history, name='assessment-history'),
    path('result/<int:session_id>/', views.session_result, name='session-result'),
]
