"""
Resume Parser Service - Traditional NLP-based extraction
Focuses on behavioral interview narrative spine: role context, accomplishments, skills, achievements
"""
import re
from typing import Dict, List, Any, Optional
from datetime import datetime
import spacy
from sentence_transformers import SentenceTransformer
import numpy as np


class ResumeParser:
    """Traditional NLP-based resume parser for behavioral interview preparation"""
    
    def __init__(self):
        # Load spaCy model (lightweight English model)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Model not found - user needs to install it
            # Run: python -m spacy download en_core_web_sm
            raise ImportError(
                "spaCy English model not found. Please install it with: "
                "python -m spacy download en_core_web_sm"
            )
        
        # Load sentence transformer for embeddings
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Common patterns
        self.role_patterns = [
            r'(?i)(?:software|engineer|developer|manager|director|lead|senior|junior|intern|assistant|analyst)',
            r'(?i)(?:product|project|data|systems|full.?stack|front.?end|back.?end)',
        ]
        
        self.quantifier_patterns = [
            r'\d+%',  # Percentages
            r'\$\d+[KMB]?',  # Money
            r'\d+\+',  # Numbers with plus
            r'\d+[KMB]?',  # Numbers with K/M/B
            r'(?:increased|decreased|improved|reduced|saved|gained|achieved).*?\d+',
        ]
        
        self.tech_stack_keywords = [
            'python', 'javascript', 'java', 'react', 'node', 'sql', 'postgresql', 'mongodb',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'terraform', 'ansible',
            'flask', 'django', 'express', 'spring', 'angular', 'vue', 'typescript',
            'scikit-learn', 'tensorflow', 'pytorch', 'pandas', 'numpy'
        ]
    
    def parse(self, resume_text: str) -> Dict[str, Any]:
        """
        Parse resume and extract structured information for behavioral interviews
        
        Focus areas:
        - Headline and last role (context, team size, scope, KPIs)
        - Work history accomplishments (quantified outcomes, tech stack, contributions)
        - Skills linked to roles/projects
        - Education/certifications (only if standout)
        - Notable achievements
        """
        doc = self.nlp(resume_text)
        
        # Extract sections
        sections = self._identify_sections(resume_text)
        
        # Extract headline and contact
        headline = self._extract_headline(resume_text, sections)
        
        # Extract work experience with detailed parsing
        work_experience = self._extract_work_experience(resume_text, sections, doc)
        
        # Extract skills and link to roles
        skills = self._extract_skills(resume_text, sections, work_experience)
        
        # Extract education (only if standout)
        education = self._extract_education(resume_text, sections)
        
        # Extract notable achievements
        achievements = self._extract_achievements(resume_text, sections, work_experience)
        
        # Get last/most recent role for detailed context
        last_role = work_experience[0] if work_experience else None
        
        # Generate embeddings for semantic search
        embeddings = self._generate_embeddings(work_experience, achievements)
        
        return {
            "headline": headline,
            "last_role": last_role,
            "work_experience": work_experience,
            "skills": skills,
            "education": education,
            "achievements": achievements,
            "embeddings": embeddings,
            "parsed_at": datetime.now().isoformat()
        }
    
    def _identify_sections(self, text: str) -> Dict[str, int]:
        """Identify section boundaries in resume"""
        sections = {}
        lines = text.split('\n')
        
        section_keywords = {
            'experience': ['EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'PROFESSIONAL EXPERIENCE'],
            'education': ['EDUCATION', 'ACADEMIC BACKGROUND'],
            'skills': ['SKILLS', 'TECHNICAL SKILLS', 'TECHNOLOGIES', 'COMPETENCIES'],
            'projects': ['PROJECTS', 'PERSONAL PROJECTS', 'SIDE PROJECTS'],
            'achievements': ['ACHIEVEMENTS', 'AWARDS', 'HONORS', 'CERTIFICATIONS', 'LEADERSHIP'],
        }
        
        for i, line in enumerate(lines):
            line_upper = line.strip().upper()
            for section_name, keywords in section_keywords.items():
                if any(keyword in line_upper for keyword in keywords):
                    sections[section_name] = i
                    break
        
        return sections
    
    def _extract_headline(self, text: str, sections: Dict[str, int]) -> Dict[str, Any]:
        """Extract headline (name, title, contact)"""
        lines = text.split('\n')
        headline_lines = []
        
        # Get first few lines before any section
        first_section_line = min(sections.values()) if sections else len(lines)
        for i in range(min(5, first_section_line)):
            line = lines[i].strip()
            if line:
                headline_lines.append(line)
        
        # Extract name (usually first line)
        name = headline_lines[0] if headline_lines else ""
        
        # Extract title (usually second line, or contains role keywords)
        title = ""
        for line in headline_lines[1:]:
            if any(re.search(pattern, line, re.IGNORECASE) for pattern in self.role_patterns):
                title = line
                break
            if not title and len(line) < 100:  # Reasonable title length
                title = line
        
        # Extract contact info
        contact = " ".join(headline_lines[2:]) if len(headline_lines) > 2 else ""
        
        return {
            "name": name,
            "title": title,
            "contact": contact
        }
    
    def _extract_work_experience(self, text: str, sections: Dict[str, int], doc) -> List[Dict[str, Any]]:
        """Extract work experience with focus on behavioral interview elements"""
        experiences = []
        
        # Get experience section
        exp_start = sections.get('experience', 0)
        exp_end = min([v for k, v in sections.items() if k != 'experience'], default=len(text.split('\n')))
        
        lines = text.split('\n')
        exp_lines = lines[exp_start:exp_end]
        exp_text = '\n'.join(exp_lines)
        
        # Split by role (look for role title patterns)
        role_blocks = self._split_into_roles(exp_text)
        
        for role_block in role_blocks:
            role_data = self._parse_role_block(role_block, doc)
            if role_data:
                experiences.append(role_data)
        
        # Sort by date (most recent first)
        experiences.sort(key=lambda x: x.get('end_date', ''), reverse=True)
        
        return experiences
    
    def _split_into_roles(self, text: str) -> List[str]:
        """Split experience section into individual role blocks"""
        # Pattern: Role Title | Company | Location | Date Range
        role_pattern = r'^([^|]+)\s*\|\s*([^|]+)\s*(?:\|\s*([^|]+))?\s*(?:\|\s*([^\n]+))?$'
        
        blocks = []
        lines = text.split('\n')
        current_block = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if this looks like a role header
            if '|' in line and any(keyword in line.lower() for keyword in ['intern', 'engineer', 'developer', 'manager', 'assistant', 'analyst', 'lead']):
                if current_block:
                    blocks.append('\n'.join(current_block))
                current_block = [line]
            else:
                current_block.append(line)
        
        if current_block:
            blocks.append('\n'.join(current_block))
        
        return blocks
    
    def _parse_role_block(self, block: str, doc) -> Optional[Dict[str, Any]]:
        """Parse a single role block for behavioral interview details"""
        lines = block.split('\n')
        if not lines:
            return None
        
        # Parse header line
        header = lines[0]
        header_parts = [p.strip() for p in header.split('|')]
        
        role_title = header_parts[0] if header_parts else ""
        company = header_parts[1] if len(header_parts) > 1 else ""
        location = header_parts[2] if len(header_parts) > 2 else ""
        date_range = header_parts[3] if len(header_parts) > 3 else ""
        
        # Parse dates
        start_date, end_date = self._parse_date_range(date_range)
        
        # Parse accomplishments (bullet points)
        accomplishments = []
        tech_stack_used = []
        quantified_outcomes = []
        team_context = {}
        personal_contributions = []
        
        for line in lines[1:]:
            line = line.strip()
            if not line or not (line.startswith('•') or line.startswith('-') or line.startswith('*')):
                continue
            
            # Remove bullet marker
            bullet = re.sub(r'^[•\-\*]\s*', '', line)
            
            # Extract quantified outcomes
            quantifiers = re.findall(r'(\d+%|\$\d+[KMB]?|\d+\+|\d+[KMB]?)', bullet)
            if quantifiers:
                quantified_outcomes.append({
                    "metric": bullet,
                    "values": quantifiers
                })
            
            # Extract tech stack mentions
            bullet_lower = bullet.lower()
            found_tech = [tech for tech in self.tech_stack_keywords if tech in bullet_lower]
            if found_tech:
                tech_stack_used.extend(found_tech)
            
            # Extract team size/context
            team_match = re.search(r'(?:team|led|collaborated with|worked with)\s+(\d+)', bullet, re.IGNORECASE)
            if team_match:
                team_size = int(team_match.group(1))
                team_context['size'] = team_size
                team_context['description'] = bullet
            
            # Check for personal contribution indicators
            contribution_indicators = ['led', 'designed', 'implemented', 'created', 'built', 'developed', 'initiated']
            if any(indicator in bullet_lower for indicator in contribution_indicators):
                personal_contributions.append(bullet)
            
            accomplishments.append({
                "text": bullet,
                "has_quantifier": len(quantifiers) > 0,
                "has_tech": len(found_tech) > 0,
                "is_personal_contribution": any(ind in bullet_lower for ind in contribution_indicators)
            })
        
        # Extract KPIs and scope from accomplishments
        kpis = [acc['text'] for acc in accomplishments if acc['has_quantifier']]
        scope_indicators = []
        for acc in accomplishments:
            if any(word in acc['text'].lower() for word in ['launched', 'deployed', 'production', 'users', 'customers', 'stakeholders']):
                scope_indicators.append(acc['text'])
        
        return {
            "role_title": role_title,
            "company": company,
            "location": location,
            "start_date": start_date,
            "end_date": end_date,
            "date_range": date_range,
            "accomplishments": accomplishments,
            "quantified_outcomes": quantified_outcomes,
            "kpis": kpis,
            "tech_stack": list(set(tech_stack_used)),  # Remove duplicates
            "team_context": team_context,
            "scope_indicators": scope_indicators,
            "personal_contributions": personal_contributions,
            "raw_text": block
        }
    
    def _parse_date_range(self, date_str: str) -> tuple:
        """Parse date range string into start and end dates"""
        if not date_str:
            return ("", "")
        
        # Patterns: "June 2023 - August 2023", "2022-2023", "Sep 2022 - May 2023"
        patterns = [
            r'(\w+\s+\d{4})\s*[-–]\s*(\w+\s+\d{4})',  # Month Year - Month Year
            r'(\d{4})\s*[-–]\s*(\d{4})',  # Year - Year
            r'(\w+\s+\d{4})\s*[-–]\s*(Present|Current)',  # Month Year - Present
        ]
        
        for pattern in patterns:
            match = re.search(pattern, date_str, re.IGNORECASE)
            if match:
                start = match.group(1).strip()
                end = match.group(2).strip() if len(match.groups()) > 1 else ""
                return (start, end)
        
        return ("", "")
    
    def _extract_skills(self, text: str, sections: Dict[str, int], work_experience: List[Dict]) -> Dict[str, Any]:
        """Extract skills and link them to roles/projects"""
        skills_by_category = {
            "languages": [],
            "frameworks": [],
            "tools": [],
            "concepts": []
        }
        
        # Get skills section
        if 'skills' in sections:
            skills_start = sections['skills']
            skills_end = min([v for k, v in sections.items() if k != 'skills' and v > skills_start], 
                           default=len(text.split('\n')))
            
            skills_text = '\n'.join(text.split('\n')[skills_start:skills_end])
            
            # Parse skills by category
            for category, keywords in [
                ("languages", ["Languages:", "Programming Languages:"]),
                ("frameworks", ["Frameworks:", "Frameworks/Tools:"]),
                ("tools", ["Tools:", "Technologies:"]),
                ("concepts", ["Concepts:", "Knowledge:"])
            ]:
                for keyword in keywords:
                    if keyword.lower() in skills_text.lower():
                        # Extract skills after keyword
                        pattern = rf'{re.escape(keyword)}\s*:?\s*(.+?)(?:\n|$)'
                        match = re.search(pattern, skills_text, re.IGNORECASE)
                        if match:
                            skills_str = match.group(1)
                            skills_list = [s.strip() for s in re.split(r'[,;]', skills_str)]
                            skills_by_category[category].extend(skills_list)
        
        # Link skills to roles
        skill_to_roles = {}
        all_skills = []
        for category, skills in skills_by_category.items():
            all_skills.extend(skills)
            for skill in skills:
                skill_lower = skill.lower()
                linked_roles = []
                for role in work_experience:
                    role_text = f"{role.get('role_title', '')} {role.get('raw_text', '')}".lower()
                    if skill_lower in role_text or any(tech in role_text for tech in self.tech_stack_keywords if skill_lower in tech):
                        linked_roles.append({
                            "role_title": role.get('role_title'),
                            "company": role.get('company')
                        })
                if linked_roles:
                    skill_to_roles[skill] = linked_roles
        
        return {
            "by_category": skills_by_category,
            "all": list(set(all_skills)),  # Remove duplicates
            "linked_to_roles": skill_to_roles
        }
    
    def _extract_education(self, text: str, sections: Dict[str, int]) -> Dict[str, Any]:
        """Extract education (only if standout - high GPA, honors, etc.)"""
        education = {
            "degree": "",
            "institution": "",
            "graduation_date": "",
            "gpa": "",
            "is_standout": False,
            "standout_reasons": []
        }
        
        if 'education' not in sections:
            return education
        
        edu_start = sections['education']
        edu_end = min([v for k, v in sections.items() if k != 'education' and v > edu_start],
                     default=len(text.split('\n')))
        
        edu_text = '\n'.join(text.split('\n')[edu_start:edu_end])
        
        # Extract degree
        degree_patterns = [
            r'(Bachelor|Master|PhD|Doctorate|Associate).*?(?:in|of)\s+([^|]+)',
            r'([A-Z\.]+)\s+in\s+([^|]+)',
        ]
        for pattern in degree_patterns:
            match = re.search(pattern, edu_text, re.IGNORECASE)
            if match:
                education["degree"] = match.group(0)
                break
        
        # Extract institution
        inst_match = re.search(r'\|\s*([^|]+)', edu_text)
        if inst_match:
            education["institution"] = inst_match.group(1).strip()
        
        # Extract GPA (standout if > 3.5)
        gpa_match = re.search(r'GPA[:\s]+(\d+\.\d+)', edu_text, re.IGNORECASE)
        if gpa_match:
            gpa = float(gpa_match.group(1))
            education["gpa"] = str(gpa)
            if gpa >= 3.5:
                education["is_standout"] = True
                education["standout_reasons"].append(f"High GPA: {gpa}")
        
        # Check for honors, awards, etc.
        if re.search(r'(?:honors|summa|magna|cum laude|dean\'s list|scholarship)', edu_text, re.IGNORECASE):
            education["is_standout"] = True
            education["standout_reasons"].append("Academic honors/awards")
        
        return education
    
    def _extract_achievements(self, text: str, sections: Dict[str, int], work_experience: List[Dict]) -> List[Dict[str, Any]]:
        """Extract notable achievements (awards, patents, high-impact work)"""
        achievements = []
        
        # Check achievements section
        if 'achievements' in sections:
            ach_start = sections['achievements']
            ach_end = min([v for k, v in sections.items() if k != 'achievements' and v > ach_start],
                         default=len(text.split('\n')))
            
            ach_text = '\n'.join(text.split('\n')[ach_start:ach_end])
            lines = ach_text.split('\n')
            
            for line in lines[1:]:  # Skip header
                line = line.strip()
                if line and (line.startswith('•') or line.startswith('-') or line.startswith('*')):
                    bullet = re.sub(r'^[•\-\*]\s*', '', line)
                    achievements.append({
                        "text": bullet,
                        "type": "award" if any(word in bullet.lower() for word in ["award", "prize", "honor"]) else "achievement"
                    })
        
        # Extract achievements from work experience (awards, recognition)
        for role in work_experience:
            for acc in role.get('accomplishments', []):
                acc_text = acc['text'].lower()
                if any(word in acc_text for word in ['award', 'prize', 'recognition', 'outstanding', 'excellence']):
                    achievements.append({
                        "text": acc['text'],
                        "type": "work_recognition",
                        "role": role.get('role_title'),
                        "company": role.get('company')
                    })
        
        return achievements
    
    def _generate_embeddings(self, work_experience: List[Dict], achievements: List[Dict]) -> Dict[str, Any]:
        """Generate vector embeddings for semantic search"""
        embeddings = {
            "work_experience": [],
            "achievements": []
        }
        
        # Embed work experience accomplishments
        for role in work_experience:
            role_embedding_texts = []
            
            # Create embedding text for each accomplishment
            for acc in role.get('accomplishments', []):
                text = f"{role.get('role_title')} at {role.get('company')}: {acc['text']}"
                role_embedding_texts.append(text)
            
            if role_embedding_texts:
                try:
                    role_embeddings = self.embedder.encode(role_embedding_texts, convert_to_numpy=True)
                    embeddings["work_experience"].append({
                        "role_title": role.get('role_title'),
                        "company": role.get('company'),
                        "embeddings": role_embeddings.tolist(),  # Convert numpy to list for JSON
                        "texts": role_embedding_texts
                    })
                except Exception as e:
                    # If embedding fails, skip but log (in production, use proper logging)
                    print(f"Warning: Failed to generate embeddings for role {role.get('role_title')}: {e}")
        
        # Embed achievements
        if achievements:
            try:
                achievement_texts = [ach['text'] for ach in achievements]
                achievement_embeddings = self.embedder.encode(achievement_texts, convert_to_numpy=True)
                embeddings["achievements"] = {
                    "embeddings": achievement_embeddings.tolist(),
                    "texts": achievement_texts
                }
            except Exception as e:
                print(f"Warning: Failed to generate embeddings for achievements: {e}")
        
        return embeddings


# Global instance
resume_parser = ResumeParser()

