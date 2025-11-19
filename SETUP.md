# BehavAced Setup Guide

Complete setup instructions for development and demo.

---

## Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 18+** (for frontend)
- **Anthropic API Key** (Claude)
- **OpenAI API Key** (optional, for voice transcription)

---

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
DATABASE_URL=postgresql://user:password@localhost:5432/behavaced  # Optional for MVP
```

**Get API Keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/

### 5. Run backend server
```bash
uvicorn main:app --reload
```

Backend should be running at: http://localhost:8000

**Verify:**
```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

---

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Run frontend
```bash
npm run dev
```

Frontend should be running at: http://localhost:3000

---

## Testing the Application

### 1. Test Backend API Endpoints

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Test Resume Upload:**
```bash
curl -X POST http://localhost:8000/api/profile/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "file_content": "base64_encoded_content_here",
    "file_name": "resume.pdf",
    "file_type": "pdf"
  }'
```

### 2. Test Frontend

1. Open http://localhost:3000
2. You should see the onboarding flow
3. Upload a resume (PDF, DOCX, or TXT)
4. Complete personality questionnaire
5. Navigate through the dashboard

---

## Sample Resume for Testing

Create a file `test_resume.txt` with this content:

```
John Doe
Software Engineer

EXPERIENCE

Software Engineering Intern | TechCorp | Summer 2023
- Led team of 4 interns to build feature that increased engagement by 35%
- Fixed critical bug causing 200+ customer complaints weekly
- Collaborated with senior engineers on onboarding redesign
- Presented to 50+ stakeholders including executives

Teaching Assistant | State University | 2022-2023
- Taught programming to 150+ students across 3 sections
- Redesigned course materials, reducing failure rate from 40% to 15%
- Mentored 20 struggling students to success
- Resolved grade disputes fairly and professionally

EDUCATION
BS Computer Science | State University | 2024 | GPA: 3.7

SKILLS
Python, JavaScript, React, Leadership, Problem-Solving
```

---

## Troubleshooting

### Backend Issues

**Issue: "ModuleNotFoundError"**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: "Anthropic API key not found"**
- Check `.env` file exists in `backend/` directory
- Verify `ANTHROPIC_API_KEY` is set correctly
- No quotes needed around the key

**Issue: "Port 8000 already in use"**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or use different port
uvicorn main:app --reload --port 8001
```

### Frontend Issues

**Issue: "Command not found: npm"**
- Install Node.js from https://nodejs.org/

**Issue: "Module not found" errors**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Issue: "Failed to fetch from API"**
- Verify backend is running at http://localhost:8000
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

### API Rate Limits

**Issue: "Rate limit exceeded" from Anthropic**
- Anthropic Claude has rate limits on free tier
- Consider caching responses during development
- Use mock data for rapid testing

---

## Development Tips

### Hot Reloading

Both backend and frontend support hot reloading:
- **Backend**: Changes to Python files auto-reload the server
- **Frontend**: Changes to React files auto-refresh the browser

### Viewing Logs

**Backend logs:**
```bash
# Server logs show in terminal where uvicorn is running
# API requests, errors, etc.
```

**Frontend logs:**
```bash
# Check browser developer console (F12)
# Server-side logs in terminal where npm run dev is running
```

### API Testing Tools

Use these tools to test API endpoints:

**Postman:**
- Import the API endpoints
- Test without frontend

**curl:**
```bash
# Example: Test answer generation
curl -X POST http://localhost:8000/api/answers/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-123",
    "question": "Tell me about a time you led a team"
  }'
```

**Browser:**
- Visit http://localhost:8000/docs
- FastAPI auto-generates interactive API docs

---

## Production Deployment

### Backend (Recommended: Railway, Render, or AWS)

**Environment Variables:**
```env
ANTHROPIC_API_KEY=your_key
ENVIRONMENT=production
DEBUG=false
```

**Deploy to Railway:**
```bash
railway login
railway init
railway up
```

### Frontend (Recommended: Vercel)

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel login
vercel
```

**Environment Variables on Vercel:**
- Add `NEXT_PUBLIC_API_URL` with your deployed backend URL

---

## Database Setup (Optional - For Production)

MVP uses in-memory storage. For production:

### Using Supabase (Recommended)

1. Create account at https://supabase.com
2. Create new project
3. Run schema migrations:

```sql
-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  user_id UUID REFERENCES users(user_id),
  profile_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  story_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  story_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Practice attempts table
CREATE TABLE practice_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id),
  attempt_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

4. Update `.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
DATABASE_URL=your_postgresql_url
```

---

## Monitoring & Debugging

### Check API Health

```bash
# Backend health
curl http://localhost:8000/health

# Check specific endpoint
curl http://localhost:8000/api/profile/test-user-id
```

### Monitor API Calls

- Claude API dashboard: https://console.anthropic.com/
- Track usage, costs, and rate limits

### Enable Debug Mode

Edit `backend/app/core/config.py`:
```python
DEBUG = True  # Enables verbose logging
```

---

## Next Steps

1. ✅ Complete setup following this guide
2. 📝 Test with sample resume
3. 🎯 Follow DEMO_GUIDE.md for demo presentation
4. 🚀 Deploy to production when ready

---

## Getting Help

- Check DEMO_GUIDE.md for common issues
- Review API docs at http://localhost:8000/docs
- Open GitHub issue for bugs
- Email: support@behavaced.com (when available)

---

## Quick Reference

### Start Everything
```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Stop Everything
```bash
# Press Ctrl+C in both terminals
```

### Reset Everything
```bash
# Backend
cd backend
rm -rf venv __pycache__
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules .next
npm install
```

