
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from roles.views import enroll_role
from roles.models import Roadmap, SkillNode, Enrollment
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate

User = get_user_model()

def debug_enroll():
    print("Direct Debug Enrollment...")
    
    # Cleanup previous attempt
    Roadmap.objects.filter(slug='python-developer').delete()
    
    user, _ = User.objects.get_or_create(username='tester')
    factory = APIRequestFactory()
    request = factory.post('/api/roles/enroll/', {'slug': 'python-developer'}, format='json')
    force_authenticate(request, user=user)
    
    # Call the view directly
    print("Calling enroll_role view directly...")
    response = enroll_role(request)
    print("Response Status:", response.status_code)
    print("Response Data:", response.data)
    
    # Verify DB
    r = Roadmap.objects.filter(slug='python-developer').first()
    if r:
        print(f"Roadmap created: {r.title}")
        print(f"Nodes found: {r.nodes.count()}")
        for n in r.nodes.all():
            print(f"  - {n.title} ({n.difficulty})")
    else:
        print("Roadmap NOT created.")

if __name__ == "__main__":
    debug_enroll()
