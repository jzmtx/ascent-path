from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.start_interview, name='start-interview'),
    path('answer/', views.submit_answer, name='submit-answer'),
    path('history/', views.interview_history, name='interview-history'),
    path('<int:session_id>/messages/', views.interview_messages, name='interview-messages'),
]
