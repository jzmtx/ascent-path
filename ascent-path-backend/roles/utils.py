import os
from django.conf import settings
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class ResumeEngine:
    """
    Advanced Career Engine: Generates minimalist, LaTeX-style professional resumes.
    """
    
    @staticmethod
    def generate_resume(enrollment):
        user = enrollment.user
        roadmap = enrollment.roadmap
        tier = enrollment.current_tier
        
        # Fetch Profile Details
        from .models import ResumeProfile
        profile, _ = ResumeProfile.objects.get_or_create(user=user)
        
        filename = f"resume_{user.username}_{roadmap.slug}_{tier}.pdf"
        media_path = os.path.join(settings.MEDIA_ROOT, 'resumes')
        if not os.path.exists(media_path):
            os.makedirs(media_path)
        
        filepath = os.path.join(media_path, filename)
        
        # Professional Margins
        doc = SimpleDocTemplate(
            filepath, 
            pagesize=LETTER,
            rightMargin=0.5 * inch,
            leftMargin=0.5 * inch,
            topMargin=0.5 * inch,
            bottomMargin=0.5 * inch
        )
        
        styles = getSampleStyleSheet()
        
        # ── LaTeX-Style Typography ───────────────────────────────────────────
        header_style = ParagraphStyle(
            'Header',
            fontSize=18,
            fontName='Helvetica-Bold',
            alignment=TA_CENTER,
            spaceAfter=4,
            textTransform='uppercase'
        )
        
        sub_header_style = ParagraphStyle(
            'SubHeader',
            fontSize=9,
            fontName='Helvetica',
            alignment=TA_CENTER,
            spaceAfter=12
        )
        
        section_title_style = ParagraphStyle(
            'SectionTitle',
            fontSize=11,
            fontName='Helvetica-Bold',
            textTransform='uppercase',
            spaceBefore=14,
            spaceAfter=2,
            borderPadding=(0, 0, 1, 0), # Bottom border effect
        )
        
        body_style = ParagraphStyle(
            'Body',
            fontSize=10,
            fontName='Helvetica',
            leading=12,
            alignment=TA_LEFT,
        )

        bold_style = ParagraphStyle(
            'Bold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        elements = []
        
        # 1. Header (Name & Contact)
        elements.append(Paragraph(f"{user.first_name} {user.last_name}", header_style))
        
        contact_info = []
        if profile.location: contact_info.append(profile.location)
        if profile.phone: contact_info.append(profile.phone)
        contact_info.append(user.email)
        
        links = []
        if profile.linkedin_url: links.append("LinkedIn")
        if profile.github_url: links.append("GitHub")
        if profile.portfolio_url: links.append("Portfolio")
        
        contact_line = "  •  ".join(contact_info)
        links_line = "  |  ".join(links)
        
        elements.append(Paragraph(contact_line, sub_header_style))
        if links_line:
            elements.append(Paragraph(links_line, sub_header_style))
        
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.black, spaceBefore=0, spaceAfter=10))

        # 2. Professional Summary
        if profile.professional_summary:
            elements.append(Paragraph("Professional Summary", section_title_style))
            elements.append(HRFlowable(width="100%", thickness=0.2, color=colors.grey, spaceBefore=0, spaceAfter=4))
            elements.append(Paragraph(profile.professional_summary, body_style))
            
        # 3. Verified Path Progress (Education/Training)
        elements.append(Paragraph("Verified Technical Training", section_title_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=colors.grey, spaceBefore=0, spaceAfter=4))
        
        path_text = f"<b>AscentPath Career Track:</b> {roadmap.title} — Verified {tier.capitalize()} Level"
        elements.append(Paragraph(path_text, body_style))
        elements.append(Spacer(1, 4))
        
        # 4. Technical Skills (Verified Nodes)
        elements.append(Paragraph("Verified Technical Skills", section_title_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=colors.grey, spaceBefore=0, spaceAfter=4))
        
        from .models import UserNodeProgress
        completed_nodes = UserNodeProgress.objects.filter(
            user=user, 
            node__roadmap=roadmap, 
            is_completed=True
        ).select_related('node').order_by('node__difficulty', 'node__order')
        
        if completed_nodes.exists():
            # Group skills by difficulty for a cleaner look
            skills_by_diff = {'beginner': [], 'intermediate': [], 'advanced': []}
            for cn in completed_nodes:
                skills_by_diff[cn.node.difficulty].append(cn.node.title)
            
            for d in ['beginner', 'intermediate', 'advanced']:
                if skills_by_diff[d]:
                    skill_line = f"<b>{d.upper()}:</b> " + ", ".join(skills_by_diff[d])
                    elements.append(Paragraph(skill_line, body_style))
                    elements.append(Spacer(1, 4))
        else:
            elements.append(Paragraph("Foundational Concepts & Syntax (In Progress)", body_style))

        # 5. Projects & Experiences
        elements.append(Paragraph("Technical Assessments & Projects", section_title_style))
        elements.append(HRFlowable(width="100%", thickness=0.2, color=colors.grey, spaceBefore=0, spaceAfter=4))
        
        project_nodes = completed_nodes.filter(node__project_description__isnull=False).exclude(node__project_description='')
        if project_nodes.exists():
            for pn in project_nodes:
                elements.append(Paragraph(f"<b>{pn.node.title}</b>", bold_style))
                elements.append(Paragraph(pn.node.description[:200] + "...", body_style))
                elements.append(Paragraph("<i>Verified via proctored assessment</i>", ParagraphStyle('SmallItalic', fontSize=8, fontName='Helvetica-Oblique')))
                elements.append(Spacer(1, 6))
        else:
            elements.append(Paragraph("Completed standardized skill assessments for verified core competencies.", body_style))

        # 6. Integrity Badge
        if tier == 'advanced':
            elements.append(Spacer(1, 20))
            elements.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceBefore=10, spaceAfter=2))
            badge_style = ParagraphStyle('Badge', fontSize=9, fontName='Helvetica-Bold', alignment=TA_CENTER)
            elements.append(Paragraph("⭐ ASCENTPATH HIGH-INTEGRITY CERTIFIED CANDIDATE ⭐", badge_style))
            elements.append(Paragraph("This document certifies that the candidate has completed all technical evaluations under secure, proctored conditions.", sub_header_style))

        doc.build(elements)
        return filepath
