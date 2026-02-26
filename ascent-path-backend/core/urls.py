from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/roadmaps/', include('roadmaps.urls')),
    path('api/progress/', include('progress.urls')),
    path('api/profile/', include('profile_app.urls')),
    path('api/assessment/', include('assessments.urls')),
    path('api/roles/', include('roles.urls')),
    path('api/interview/', include('interviews.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
