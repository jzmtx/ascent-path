from django.core.management.base import BaseCommand
from roles.models import Roadmap, SkillNode


ROADMAPS_DATA = [
    {
        'slug': 'frontend-developer',
        'title': 'Frontend Developer',
        'description': 'Master the art of building beautiful, performant user interfaces for the web.',
        'icon': '🎨',
        'color': 'blue',
        'category': 'Web Development',
        'job_tags': ['react', 'javascript', 'frontend', 'css', 'html', 'typescript', 'vue', 'angular'],
        'estimated_months': 6,
        'is_trending': True,
        'nodes': [
            {'title': 'HTML5 Fundamentals', 'description': 'Semantic HTML, forms, accessibility, SEO basics', 'resource_url': 'https://developer.mozilla.org/en-US/docs/Web/HTML', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 7},
            {'title': 'CSS3 & Layouts', 'description': 'Flexbox, Grid, animations, responsive design, media queries', 'resource_url': 'https://developer.mozilla.org/en-US/docs/Web/CSS', 'difficulty': 'beginner', 'order': 2, 'estimated_days': 10},
            {'title': 'JavaScript Core', 'description': 'Variables, functions, DOM, events, ES6+, async/await, closures', 'resource_url': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'difficulty': 'beginner', 'order': 3, 'estimated_days': 21},
            {'title': 'TypeScript', 'description': 'Types, interfaces, generics, type inference, strict mode', 'resource_url': 'https://www.typescriptlang.org/docs/', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 10},
            {'title': 'React.js', 'description': 'Components, hooks, context, state management, React Router', 'resource_url': 'https://react.dev/learn', 'difficulty': 'intermediate', 'order': 5, 'estimated_days': 21},
            {'title': 'State Management', 'description': 'Redux Toolkit, Zustand, React Query for server state', 'resource_url': 'https://redux-toolkit.js.org/', 'difficulty': 'intermediate', 'order': 6, 'estimated_days': 7},
            {'title': 'Next.js', 'description': 'SSR, SSG, App Router, API routes, deployment', 'resource_url': 'https://nextjs.org/docs', 'difficulty': 'intermediate', 'order': 7, 'estimated_days': 14},
            {'title': 'Testing', 'description': 'Jest, React Testing Library, Cypress for E2E', 'resource_url': 'https://jestjs.io/docs/getting-started', 'difficulty': 'intermediate', 'order': 8, 'estimated_days': 7},
            {'title': 'Performance Optimization', 'description': 'Lighthouse, Core Web Vitals, lazy loading, code splitting, memoization', 'resource_url': 'https://developer.mozilla.org/en-US/docs/Web/Performance', 'difficulty': 'advanced', 'order': 9, 'estimated_days': 7},
            {'title': 'Build Tools & DevOps', 'description': 'Vite, Webpack, CI/CD with GitHub Actions, Docker basics', 'resource_url': 'https://vitejs.dev/', 'difficulty': 'advanced', 'order': 10, 'estimated_days': 5},
        ]
    },
    {
        'slug': 'backend-developer',
        'title': 'Backend Developer',
        'description': 'Build robust, scalable server-side applications and APIs that power modern apps.',
        'icon': '⚙️',
        'color': 'green',
        'category': 'Web Development',
        'job_tags': ['python', 'django', 'backend', 'nodejs', 'api', 'postgresql', 'rest', 'fastapi'],
        'estimated_months': 7,
        'is_trending': True,
        'nodes': [
            {'title': 'Python Fundamentals', 'description': 'Data types, functions, OOP, modules, file I/O, error handling', 'resource_url': 'https://docs.python.org/3/tutorial/', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 14},
            {'title': 'Django Framework', 'description': 'Models, views, templates, admin, migrations, signals', 'resource_url': 'https://docs.djangoproject.com/', 'difficulty': 'intermediate', 'order': 2, 'estimated_days': 21},
            {'title': 'REST API Design', 'description': 'DRF, serializers, viewsets, authentication, pagination, versioning', 'resource_url': 'https://www.django-rest-framework.org/', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 14},
            {'title': 'PostgreSQL & SQL', 'description': 'Queries, joins, indexes, transactions, query optimization', 'resource_url': 'https://www.postgresql.org/docs/', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 14},
            {'title': 'Authentication & Security', 'description': 'JWT, OAuth2, bcrypt, HTTPS, CORS, SQL injection prevention', 'resource_url': 'https://owasp.org/www-project-top-ten/', 'difficulty': 'intermediate', 'order': 5, 'estimated_days': 7},
            {'title': 'Redis & Caching', 'description': 'Cache strategies, session management, message queues with Celery', 'resource_url': 'https://redis.io/docs/', 'difficulty': 'intermediate', 'order': 6, 'estimated_days': 7},
            {'title': 'Docker', 'description': 'Containers, Docker Compose, images, networking, volumes', 'resource_url': 'https://docs.docker.com/', 'difficulty': 'intermediate', 'order': 7, 'estimated_days': 7},
            {'title': 'System Design Basics', 'description': 'Load balancing, horizontal scaling, microservices, CAP theorem', 'resource_url': 'https://github.com/donnemartin/system-design-primer', 'difficulty': 'advanced', 'order': 8, 'estimated_days': 14},
            {'title': 'Cloud Deployment', 'description': 'AWS EC2/RDS, Render, Railway, environment configs, CI/CD', 'resource_url': 'https://docs.aws.amazon.com/', 'difficulty': 'advanced', 'order': 9, 'estimated_days': 10},
        ]
    },
    {
        'slug': 'fullstack-developer',
        'title': 'Full Stack Developer',
        'description': 'The complete developer — build both frontend UIs and backend APIs end-to-end.',
        'icon': '🔥',
        'color': 'orange',
        'category': 'Web Development',
        'job_tags': ['fullstack', 'react', 'nodejs', 'python', 'javascript', 'django', 'next'],
        'estimated_months': 10,
        'is_trending': True,
        'nodes': [
            {'title': 'HTML5 + CSS3', 'description': 'Semantic HTML, Flexbox, Grid, responsive design', 'resource_url': 'https://developer.mozilla.org/en-US/docs/Web', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 14},
            {'title': 'JavaScript & TypeScript', 'description': 'ES6+, async/await, TypeScript types and generics', 'resource_url': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'difficulty': 'beginner', 'order': 2, 'estimated_days': 21},
            {'title': 'React.js', 'description': 'Hooks, context, state management, routing', 'resource_url': 'https://react.dev', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 21},
            {'title': 'Python + Django', 'description': 'OOP, Django models, migrations, DRF APIs', 'resource_url': 'https://docs.djangoproject.com/', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 21},
            {'title': 'Databases (SQL + NoSQL)', 'description': 'PostgreSQL queries, MongoDB basics, ORM patterns', 'resource_url': 'https://www.postgresql.org/docs/', 'difficulty': 'intermediate', 'order': 5, 'estimated_days': 14},
            {'title': 'Auth & APIs', 'description': 'JWT, REST, GraphQL basics, CORS, rate limiting', 'resource_url': 'https://jwt.io/introduction/', 'difficulty': 'intermediate', 'order': 6, 'estimated_days': 10},
            {'title': 'Next.js Full Stack', 'description': 'App Router, server components, API routes, deployment', 'resource_url': 'https://nextjs.org/docs', 'difficulty': 'intermediate', 'order': 7, 'estimated_days': 14},
            {'title': 'Docker & Deployment', 'description': 'Containerization, CI/CD, cloud platforms, env management', 'resource_url': 'https://docs.docker.com/', 'difficulty': 'advanced', 'order': 8, 'estimated_days': 10},
        ]
    },
    {
        'slug': 'devops-engineer',
        'title': 'DevOps Engineer',
        'description': 'Bridge development and operations — automate, deploy, and scale systems reliably.',
        'icon': '🚀',
        'color': 'purple',
        'category': 'Infrastructure',
        'job_tags': ['devops', 'docker', 'kubernetes', 'aws', 'ci-cd', 'terraform', 'linux'],
        'estimated_months': 9,
        'is_trending': True,
        'nodes': [
            {'title': 'Linux & Shell Scripting', 'description': 'Bash, file system, process management, cron jobs, permissions', 'resource_url': 'https://www.gnu.org/software/bash/manual/', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 14},
            {'title': 'Git & Version Control', 'description': 'Branching strategies, GitFlow, rebase, conflict resolution', 'resource_url': 'https://git-scm.com/doc', 'difficulty': 'beginner', 'order': 2, 'estimated_days': 5},
            {'title': 'Docker', 'description': 'Containers, images, Compose, networking, multi-stage builds', 'resource_url': 'https://docs.docker.com/', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 10},
            {'title': 'Kubernetes', 'description': 'Pods, services, deployments, Helm charts, scaling, monitoring', 'resource_url': 'https://kubernetes.io/docs/', 'difficulty': 'advanced', 'order': 4, 'estimated_days': 21},
            {'title': 'AWS Core Services', 'description': 'EC2, S3, RDS, IAM, VPC, Lambda, Load Balancer', 'resource_url': 'https://docs.aws.amazon.com/', 'difficulty': 'intermediate', 'order': 5, 'estimated_days': 21},
            {'title': 'CI/CD Pipelines', 'description': 'GitHub Actions, Jenkins, GitLab CI, automated testing & deploy', 'resource_url': 'https://docs.github.com/en/actions', 'difficulty': 'intermediate', 'order': 6, 'estimated_days': 10},
            {'title': 'Infrastructure as Code', 'description': 'Terraform, AWS CloudFormation, Ansible', 'resource_url': 'https://developer.hashicorp.com/terraform/docs', 'difficulty': 'advanced', 'order': 7, 'estimated_days': 14},
            {'title': 'Monitoring & Observability', 'description': 'Prometheus, Grafana, ELK stack, distributed tracing', 'resource_url': 'https://prometheus.io/docs/', 'difficulty': 'advanced', 'order': 8, 'estimated_days': 10},
        ]
    },
    {
        'slug': 'ml-engineer',
        'title': 'ML Engineer',
        'description': 'Design, train, and deploy machine learning models that solve real-world problems.',
        'icon': '🧠',
        'color': 'pink',
        'category': 'AI & ML',
        'job_tags': ['machine-learning', 'python', 'tensorflow', 'pytorch', 'mlops', 'ai', 'nlp', 'deep-learning'],
        'estimated_months': 10,
        'is_trending': True,
        'nodes': [
            {'title': 'Python for ML', 'description': 'NumPy, Pandas, Matplotlib, Jupyter notebooks', 'resource_url': 'https://numpy.org/doc/', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 14},
            {'title': 'Statistics & Math', 'description': 'Linear algebra, probability, calculus for ML, distributions', 'resource_url': 'https://www.khanacademy.org/math/statistics-probability', 'difficulty': 'beginner', 'order': 2, 'estimated_days': 21},
            {'title': 'Classical ML', 'description': 'Scikit-learn, regression, classification, clustering, evaluation metrics', 'resource_url': 'https://scikit-learn.org/stable/user_guide.html', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 21},
            {'title': 'Deep Learning', 'description': 'Neural networks, CNNs, RNNs, backpropagation, PyTorch/TensorFlow', 'resource_url': 'https://pytorch.org/tutorials/', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 28},
            {'title': 'NLP', 'description': 'Tokenization, embeddings, transformers, BERT, LLMs, fine-tuning', 'resource_url': 'https://huggingface.co/docs/transformers/', 'difficulty': 'advanced', 'order': 5, 'estimated_days': 21},
            {'title': 'MLOps', 'description': 'Model versioning, MLflow, Docker for ML, model serving, monitoring', 'resource_url': 'https://mlflow.org/docs/latest/index.html', 'difficulty': 'advanced', 'order': 6, 'estimated_days': 14},
        ]
    },
    {
        'slug': 'data-analyst',
        'title': 'Data Analyst',
        'description': 'Extract insights from data and tell compelling stories with numbers and visualizations.',
        'icon': '📊',
        'color': 'cyan',
        'category': 'Data',
        'job_tags': ['data-analyst', 'sql', 'python', 'tableau', 'power-bi', 'excel', 'analytics'],
        'estimated_months': 5,
        'is_trending': False,
        'nodes': [
            {'title': 'Excel & Google Sheets', 'description': 'Pivot tables, VLOOKUP, formulas, conditional formatting', 'resource_url': 'https://support.microsoft.com/en-us/excel', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 7},
            {'title': 'SQL', 'description': 'SELECT, JOINs, subqueries, window functions, aggregations', 'resource_url': 'https://www.postgresql.org/docs/', 'difficulty': 'beginner', 'order': 2, 'estimated_days': 14},
            {'title': 'Python for Analysis', 'description': 'Pandas, NumPy, Matplotlib, Seaborn', 'resource_url': 'https://pandas.pydata.org/docs/', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 14},
            {'title': 'Statistics', 'description': 'Descriptive stats, hypothesis testing, A/B testing, correlation', 'resource_url': 'https://www.khanacademy.org/math/statistics-probability', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 14},
            {'title': 'Data Visualization', 'description': 'Tableau, Power BI, storytelling with data, dashboards', 'resource_url': 'https://public.tableau.com/en-us/s/resources', 'difficulty': 'intermediate', 'order': 5, 'estimated_days': 14},
        ]
    },
    {
        'slug': 'mobile-developer',
        'title': 'Mobile Developer',
        'description': 'Build cross-platform mobile applications for iOS and Android using React Native.',
        'icon': '📱',
        'color': 'violet',
        'category': 'Mobile',
        'job_tags': ['react-native', 'mobile', 'ios', 'android', 'expo', 'flutter'],
        'estimated_months': 7,
        'is_trending': False,
        'nodes': [
            {'title': 'JavaScript + React', 'description': 'ES6+, React fundamentals, hooks, component patterns', 'resource_url': 'https://react.dev/learn', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 21},
            {'title': 'React Native Basics', 'description': 'Core components, StyleSheet, platform-specific code, Expo', 'resource_url': 'https://reactnative.dev/docs/getting-started', 'difficulty': 'intermediate', 'order': 2, 'estimated_days': 14},
            {'title': 'Navigation', 'description': 'React Navigation, stack, tab, drawer navigators, deep linking', 'resource_url': 'https://reactnavigation.org/docs/getting-started/', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 7},
            {'title': 'State & Storage', 'description': 'Redux/Zustand, AsyncStorage, SQLite, secure storage', 'resource_url': 'https://docs.expo.dev/versions/latest/sdk/async-storage/', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 7},
            {'title': 'Native Features', 'description': 'Camera, GPS, push notifications, biometrics, sensors', 'resource_url': 'https://docs.expo.dev/', 'difficulty': 'advanced', 'order': 5, 'estimated_days': 10},
            {'title': 'App Store Deployment', 'description': 'App signing, Play Store & App Store submission, EAS Build', 'resource_url': 'https://docs.expo.dev/distribution/app-stores/', 'difficulty': 'advanced', 'order': 6, 'estimated_days': 5},
        ]
    },
    {
        'slug': 'cloud-architect',
        'title': 'Cloud Architect',
        'description': 'Design and oversee enterprise-scale cloud infrastructure on AWS, GCP, or Azure.',
        'icon': '☁️',
        'color': 'sky',
        'category': 'Infrastructure',
        'job_tags': ['aws', 'cloud', 'azure', 'gcp', 'architect', 'terraform', 'serverless'],
        'estimated_months': 12,
        'is_trending': False,
        'nodes': [
            {'title': 'Cloud Fundamentals', 'description': 'IaaS/PaaS/SaaS, regions, AZs, pricing models, shared responsibility', 'resource_url': 'https://docs.aws.amazon.com/whitepapers/latest/aws-overview/', 'difficulty': 'beginner', 'order': 1, 'estimated_days': 7},
            {'title': 'AWS Core (Compute & Storage)', 'description': 'EC2, S3, EBS, EFS, AMIs, auto scaling groups', 'resource_url': 'https://docs.aws.amazon.com/ec2/', 'difficulty': 'intermediate', 'order': 2, 'estimated_days': 14},
            {'title': 'Networking & Security', 'description': 'VPC, subnets, security groups, IAM, WAF, CloudFront', 'resource_url': 'https://docs.aws.amazon.com/vpc/', 'difficulty': 'intermediate', 'order': 3, 'estimated_days': 14},
            {'title': 'Managed Databases', 'description': 'RDS, Aurora, DynamoDB, ElastiCache, database migration', 'resource_url': 'https://docs.aws.amazon.com/rds/', 'difficulty': 'intermediate', 'order': 4, 'estimated_days': 10},
            {'title': 'Serverless Architecture', 'description': 'Lambda, API Gateway, SQS, SNS, EventBridge, Step Functions', 'resource_url': 'https://docs.aws.amazon.com/lambda/', 'difficulty': 'advanced', 'order': 5, 'estimated_days': 14},
            {'title': 'IaC & Automation', 'description': 'Terraform, CloudFormation, CDK, Ansible, GitOps', 'resource_url': 'https://developer.hashicorp.com/terraform/', 'difficulty': 'advanced', 'order': 6, 'estimated_days': 14},
            {'title': 'Cost Optimization & Well-Architected', 'description': 'AWS Well-Architected Framework, cost governance, rightsizing', 'resource_url': 'https://docs.aws.amazon.com/wellarchitected/', 'difficulty': 'advanced', 'order': 7, 'estimated_days': 10},
        ]
    },
]


class Command(BaseCommand):
    help = 'Seed all 8 roadmaps with skill nodes into the database'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for rm_data in ROADMAPS_DATA:
            nodes_data = rm_data.pop('nodes')
            roadmap, created = Roadmap.objects.update_or_create(
                slug=rm_data['slug'],
                defaults=rm_data,
            )
            if created:
                created_count += 1
                self.stdout.write(f'  [+] Created roadmap: {roadmap.title}')
            else:
                updated_count += 1
                self.stdout.write(f'  [~] Updated roadmap: {roadmap.title}')

            # Clear existing nodes and recreate
            roadmap.nodes.all().delete()
            for node_data in nodes_data:
                SkillNode.objects.create(roadmap=roadmap, **node_data)

            self.stdout.write(f'     -> {len(nodes_data)} nodes seeded')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Created: {created_count}, Updated: {updated_count} roadmaps'
        ))
