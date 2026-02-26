
import requests
import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from roles.models import Roadmap, Enrollment, RoleAnalysis

User = get_user_model()

def test_enrollment():
    print("Simulating Enrollment Test...")
    
    # 1. Get or create test user
    user, _ = User.objects.get_or_create(username='tester', email='tester@example.com')
    refresh = RefreshToken.for_user(user)
    token = str(refresh.access_token)
    
    # 2. Pick a role to enroll in (e.g., Python Developer)
    # Ensure a RoleAnalysis exists first
    RoleAnalysis.objects.get_or_create(
        role_slug='python-developer',
        defaults={'role_title': 'Python Developer', 'must_have_skills': ['Python', 'Django']}
    )
    
    url = "http://localhost:8000/api/roles/enroll/"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {"slug": "python-developer"}
    
    try:
        print(f"Calling Enrollment API for 'python-developer'...")
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        print("Status Code:", resp.status_code)
        data = resp.json()
        print("Response:", json.dumps(data, indent=2))
        
        if resp.status_code == 200:
            # Check DB
            roadmap = Roadmap.objects.get(slug='python-developer')
            print(f"Roadmap Title: {roadmap.title}")
            print(f"Node Count: {roadmap.nodes.count()}")
            enrollment = Enrollment.objects.filter(user=user, roadmap=roadmap).exists()
            print(f"Is Enrolled in DB: {enrollment}")
            
            # Print sample nodes
            for node in roadmap.nodes.all()[:3]:
                print(f"  - [{node.difficulty}] {node.title}")
    except Exception as e:
        print("Test Error:", e)

if __name__ == "__main__":
    test_enrollment()
