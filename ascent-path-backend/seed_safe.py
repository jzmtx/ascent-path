import io
import sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from roles.models import Roadmap

roles = [
    ('frontend-developer', 'Frontend Developer', 'Master the craft of building beautiful, interactive web user interfaces.', 'FE', 'blue', 'Web Development', 4, 'react, javascript, frontend, html, css'),
    ('backend-developer', 'Backend Developer', 'Architect robust APIs and manage databases for scalable applications.', 'BE', 'green', 'Web Development', 4, 'python, node, backend, api, database'),
    ('data-scientist', 'Data Scientist', 'Transform raw data into actionable insights using machine learning.', 'DS', 'purple', 'Data & AI', 6, 'python, data science, machine learning, sql'),
    ('devops-engineer', 'DevOps Engineer', 'Bridge the gap between development and operations with automation.', 'DO', 'orange', 'Cloud & Infra', 5, 'aws, docker, kubernetes, ci/cd'),
    ('mobile-developer', 'Mobile Developer', 'Build native and cross-platform mobile apps for iOS and Android.', 'MD', 'teal', 'Mobile App', 4, 'react native, swift, kotlin, ios, android'),
    ('fullstack-engineer', 'Full-Stack Engineer', 'Build end-to-end web applications, from UI components to database architecture.', 'FS', 'indigo', 'Web Development', 6, 'javascript, react, node, full stack, web')
]

for slug, title, desc, icon, color, cat, mos, tags in roles:
    r, created = Roadmap.objects.get_or_create(
        slug=slug, 
        defaults=dict(title=title, description=desc, icon=icon, color=color, category=cat, estimated_months=mos, job_tags=tags)
    )
    if not created:
        r.title = title
        r.description = desc
        r.icon = icon
        r.save()

print('Seeded roadmaps successfully.')
