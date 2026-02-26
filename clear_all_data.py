import os
import django
import sys

# Add the project directory to sys.path
sys.path.append(r'd:\kvg\ascent-path-backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

# Delete all users except superusers
users_to_wipe = User.objects.filter(is_superuser=False)
count = users_to_wipe.count()

print(f"Starting data wipe for {count} users...")

# Deleting users will cascade delete all their related:
# - Enrollments
# - Roadmap Progress
# - User Skills / Certs / Projects
# - Assessment Sessions / Answers
# - Resume Profiles
users_to_wipe.delete()

print("Wipe complete. Database is now clean of test data.")
print(f"Remaining Users: {User.objects.count()} (Admin accounts only)")
