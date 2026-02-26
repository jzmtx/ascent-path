from django.urls import path
from . import views

urlpatterns = [
    path('onboarding/', views.save_onboarding, name='save-onboarding'),
    path('skills/', views.my_skills, name='my-skills'),
    path('me/', views.my_profile, name='my-profile'),
    path('resume/upload/', views.upload_resume, name='upload-resume'),
]
