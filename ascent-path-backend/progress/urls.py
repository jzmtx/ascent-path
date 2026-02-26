from django.urls import path
from .views import MyProgressView, UpdateProgressView, EnrollView, MyEnrollmentsView

urlpatterns = [
    path('', MyProgressView.as_view(), name='my-progress'),
    path('update/', UpdateProgressView.as_view(), name='update-progress'),
    path('enroll/', EnrollView.as_view(), name='enroll'),
    path('enrollments/', MyEnrollmentsView.as_view(), name='my-enrollments'),
]
