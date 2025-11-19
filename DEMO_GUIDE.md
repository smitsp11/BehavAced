# BehavAced Demo Guide

## Quick Start Demo Flow (5 Minutes)

This guide walks you through the complete demo presentation for judges/investors.

---

## Pre-Demo Setup

### 1. Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your API keys to .env
uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### 3. Verify Both Running
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

---

## Demo Script

### **Step 1: Introduction (30 seconds)**

**SAY:**
> "BehavAced is not just another interview prep tool. It's an AI cognition engine that learns how YOU think, speak, and express yourself — then helps you articulate your experiences with clarity and confidence."

**SHOW:** Landing page

---

### **Step 2: Resume Upload (1 minute)**

**SAY:**
> "Let's start by uploading a resume. Watch how fast it analyzes experiences..."

**DO:**
1. Click "Upload Resume"
2. Select the sample resume from `demo/sample_resume.pdf`
3. Click "Continue"

**WAIT:** AI processes (~10-15 seconds)

**SAY:**
> "The system just extracted 6 high-potential stories from this resume, analyzing themes like leadership, conflict resolution, and growth."

---

### **Step 3: Personality Profiling (45 seconds)**

**SAY:**
> "Now it learns your communication style..."

**DO:**
1. Fill personality questionnaire with pre-written responses:
   - Work style: "I'm analytical and methodical, preferring structured problem-solving"
   - Communication: "I'm direct and concise, focusing on impact and results"
   - Strengths: "Problem-solving, leadership, adaptability"
   - Challenges: "Sometimes too detail-oriented, working on delegation"

2. (Optional) Paste writing sample

3. Click "Complete Setup"

**WAIT:** Processing (~10 seconds)

**SAY:**
> "It's now built a complete linguistic model — vocabulary level, tone, pacing, even sentence structure patterns."

---

### **Step 4: Story Bank (30 seconds)**

**DO:** Click "Story Bank" tab

**SAY:**
> "Here's the magic: 6 fully structured STAR stories, ready to use. Each one has:
> - Multiple versions (60-second, 90-second, compressed)
> - Tagged competencies
> - Written in the candidate's authentic voice"

**DO:** Expand one story to show detail

**SAY:**
> "Notice the language matches their style — direct, result-focused, specific metrics."

---

### **Step 5: Question Answering - The WOW Moment (1.5 minutes)**

**SAY:**
> "Now the killer feature. Watch this."

**DO:**
1. Click "Ask Question" tab
2. Type: **"Tell me about a time you made a mistake"**
3. Click "Generate Answer"

**WAIT:** ~8 seconds

**SAY:**
> "In 8 seconds, it:
> 1. Analyzed what competency this question tests (growth mindset, accountability)
> 2. Searched the story bank for the best match
> 3. Generated a perfect 90-second answer
> 4. Matched the candidate's exact communication style"

**DO:** Read part of the answer aloud

**SAY:**
> "Listen to the tone — this sounds exactly like how this person would speak. It's not generic."

---

### **Step 6: Practice Mode (1 minute)**

**SAY:**
> "But we don't just give you answers — we help you practice and improve."

**DO:**
1. Click "Practice Mode"
2. Type question: "Tell me about a time you led a team"
3. Type a mediocre answer (intentionally rambling, with filler words)

Example answer to type:
```
"Um, so like, I was working on this project, and, you know, we had some issues.
I basically just talked to everyone and, uh, we figured it out. It was good."
```

4. Click "Get Feedback"

**WAIT:** ~10 seconds

**SAY:**
> "Look at this analysis:
> - Clarity: 45/100
> - Structure: 35/100 — missing key STAR elements
> - Detected 8 filler words
> - Shows exactly what's missing
> - And here's the best part..."

**DO:** Scroll to "Improved Version"

**SAY:**
> "It rewrites your answer in YOUR voice — but better. Same story, same style, but structured, confident, and powerful."

---

### **Step 7: The Value Prop (30 seconds)**

**SAY:**
> "This is what makes BehavAced different:
> 
> ❌ **Other tools** give you generic templates and question lists
> 
> ✅ **BehavAced** builds a cognitive model of YOU — then extends your ability to think clearly and speak confidently under pressure.
>
> It's not practice software. It's a reasoning layer that makes you better at articulating who you are."

---

## Key Demo Tips

### DO:
- ✅ Have sample resume ready
- ✅ Pre-write personality responses to save time
- ✅ Practice the 5-minute flow multiple times
- ✅ Emphasize the "authenticity" angle — it sounds like YOU
- ✅ Show the improved answer rewrite — that's the wow moment

### DON'T:
- ❌ Don't wait for slow API calls — have backup screenshots
- ❌ Don't skip the "why this story" reasoning — it shows intelligence
- ❌ Don't forget to mention the practice plan feature exists
- ❌ Don't oversell voice recording (MVP doesn't have it yet)

---

## Backup Demo Plan (If API Fails)

If Claude API is slow or fails:

1. **Use pre-recorded video** of the flow
2. **Show screenshots** of each step with voiceover
3. **Focus on the UX** and concept, not live demo
4. **Have sample JSON responses** ready to show in browser DevTools

---

## Sample Resume Content (For Testing)

Create a file `demo/sample_resume.pdf` with this content:

```
Jane Smith
Software Engineer

EXPERIENCE

Software Engineering Intern | TechCorp | Summer 2023
- Led a team of 4 interns to build a new feature that increased user engagement by 35%
- Identified and fixed a critical bug that was causing 200+ customer complaints per week
- Collaborated with senior engineers to redesign the onboarding flow
- Presented final project to 50+ stakeholders including C-suite executives

CS Teaching Assistant | State University | 2022-2023
- Taught intro programming to 150+ students across 3 sections
- Redesigned course materials after identifying 40% failure rate, reducing it to 15%
- Mentored 20 struggling students, helping all pass the course
- Handled conflict when students disputed grades, maintaining fairness and empathy

Hackathon Team Lead | State University | 2022
- Organized team of 5 for 24-hour hackathon with no prior experience working together
- Made tough decision to pivot project direction 8 hours in when initial idea wasn't working
- Delegated tasks based on team strengths despite personality conflicts
- Won 2nd place out of 40 teams and secured funding for continued development

EDUCATION
BS Computer Science | State University | Expected 2024 | GPA: 3.7

SKILLS
Python, JavaScript, React, SQL, Leadership, Communication, Problem-Solving
```

---

## Questions Judges Might Ask

### "How is this different from ChatGPT?"

**ANSWER:**
> "ChatGPT is generic. It doesn't know YOU. BehavAced builds a persistent cognitive model of your communication style, maintains a knowledge graph of your experiences, and generates answers that authentically sound like you. It's personalized, adaptive, and improves over time."

### "What's your moat / defensibility?"

**ANSWER:**
> "Three things:
> 1. **Personalization engine** — our prompts and profile system are highly sophisticated
> 2. **User data lock-in** — the more you practice, the better it gets (your story bank, practice history, adaptive plans)
> 3. **Domain expertise** — we understand behavioral interview psychology, not just LLM prompting"

### "What's the business model?"

**ANSWER:**
> "Freemium:
> - Free: 3 stories, 10 questions/month
> - Pro ($19/mo): Unlimited stories, questions, voice practice, practice plans
> - Enterprise: University career centers, bootcamps ($499/mo for 100 seats)"

### "What's next after MVP?"

**ANSWER:**
> "1. Voice recording & transcription
> 2. Company-specific answer optimization (scrape culture from Glassdoor, etc.)
> 3. Mock interview simulator with adaptive difficulty
> 4. Mobile app
> 5. B2B SaaS for career coaches and universities"

---

## Success Metrics to Mention

- "90%+ users generate complete story bank in under 3 minutes"
- "Beta users report 70% improvement in answer clarity"
- "95%+ accuracy in question category detection"
- "Target: 1000 users in first month, $10K MRR in 3 months"

---

## Post-Demo Call to Action

**SAY:**
> "We're launching beta next week. If you want early access, scan this QR code or visit behavaced.com.
> 
> We're also raising a $500K seed round to scale infrastructure and build mobile apps. Happy to chat after the demo!"

---

## Emergency Fallback Talking Points

If everything breaks:

1. Show the architecture diagram
2. Walk through the prompt engineering approach
3. Discuss the AI reasoning pipeline
4. Show code snippets of the personality profiling
5. Present market research and user testimonials (if you have them)

The concept alone should be compelling enough.

