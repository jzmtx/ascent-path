import os
import django
import sys

# Add the project directory to sys.path
sys.path.append(r'd:\kvg\ascent-path-backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

# Configuration
EMAIL = 'admin@ascentpath.com'
USERNAME = 'admin'
PASSWORD = 'adminpassword123'

if not User.objects.filter(email=EMAIL).exists():
    User.objects.create_superuser(
        email=EMAIL,
        username=USERNAME,
        password=PASSWORD
    )
    print(f"Superuser created successfully: {EMAIL}")
else:
    print(f"Superuser already exists: {EMAIL}")
