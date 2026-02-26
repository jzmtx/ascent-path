import os
import django
import sys

# Add the project directory to sys.path
sys.path.append(r'd:\kvg\ascent-path-backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from roles.models import Roadmap

ds_roadmap = Roadmap.objects.filter(title__icontains='Data Scientist').first()
if ds_roadmap:
    print(f"Roadmap: {ds_roadmap.title}")
    nodes = ds_roadmap.nodes.all().order_by('order')[:3]
    for n in nodes:
        print(f"- Node: {n.title}")
        print(f"  Video: {n.video_url}")
        print(f"  Project: {len(n.project_description) > 0}")
        print(f"  Resource: {n.resource_url}")
else:
    print("No Data Scientist roadmap found.")
