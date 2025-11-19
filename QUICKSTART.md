# BehavAced - Quick Start Guide

Get BehavAced running in 5 minutes!

---

## Prerequisites

Before you begin, make sure you have:
- ✅ Python 3.9 or higher
- ✅ Node.js 18 or higher
- ✅ Anthropic API key ([Get one here](https://console.anthropic.com/))

---

## Option 1: Automatic Setup (Recommended)

### macOS/Linux:

```bash
# Navigate to project
cd /Users/smit/Downloads/BehavAced

# Run startup script
./start.sh
```

The script will:
1. Create environment files if needed
2. Install all dependencies
3. Start both servers
4. Open the app in your browser

### Windows:

```bash
# Navigate to project
cd C:\Users\YourName\Downloads\BehavAced

# Start backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
uvicorn main:app --reload

# In a new terminal, start frontend
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

---

## Option 2: Manual Setup

### Step 1: Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Edit .env and add your keys:
# ANTHROPIC_API_KEY=your_key_here
```

### Step 2: Start Backend

```bash
# Make sure you're in backend/ directory
uvicorn main:app --reload
```

✅ Backend should be running at http://localhost:8000

### Step 3: Frontend Setup (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development server
npm run dev
```

✅ Frontend should be running at http://localhost:3000

---

## Verify Installation

### 1. Check Backend
```bash
curl http://localhost:8000/health
```
Should return: `{"status":"healthy"}`

### 2. Check Frontend
Open browser to: http://localhost:3000

You should see the BehavAced onboarding screen.

### 3. Check API Docs
Visit: http://localhost:8000/docs

You should see interactive API documentation.

---

## First Test Run

### 1. Upload Resume

Use the sample resume provided:
- File: `demo/sample_resume.txt`
- Or create your own

### 2. Complete Personality Questionnaire

Example responses:
```
Work Style: "I'm analytical and detail-oriented, preferring structured problem-solving approaches."

Communication: "I'm direct and concise, focusing on key points and impact."

Strengths: "Problem-solving, leadership, adaptability"

Challenges: "Sometimes too detail-oriented"
```

### 3. Ask a Question

Try: "Tell me about a time you led a team"

Watch the AI:
- Route the question
- Select best story
- Generate personalized answer

### 4. Practice Mode

- Type or record an answer
- Get instant feedback
- See improved version

---

## Troubleshooting

### Backend Issues

**"Anthropic API key not found"**
```bash
# Make sure .env file exists in backend/
ls backend/.env

# Check the key is set
cat backend/.env | grep ANTHROPIC
```

**"Port 8000 already in use"**
```bash
# Find and kill the process
lsof -i :8000          # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Or use a different port
uvicorn main:app --reload --port 8001
```

**"Module not found"**
```bash
# Make sure virtual environment is activated
# You should see (venv) in your terminal prompt

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Issues

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**"Module not found"**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**"Failed to fetch"**
- Make sure backend is running
- Check .env.local has: `NEXT_PUBLIC_API_URL=http://localhost:8000`

---

## What to Do Next

### For Demo:
1. Read **DEMO_GUIDE.md** for 5-minute presentation script
2. Practice the demo flow
3. Prepare sample resume
4. Test on different browsers

### For Development:
1. Read **ARCHITECTURE.md** to understand the system
2. Review **SETUP.md** for detailed setup
3. Check API docs at http://localhost:8000/docs
4. Explore the code structure

### For Deployment:
1. Sign up for Railway (backend) and Vercel (frontend)
2. Follow deployment instructions in **SETUP.md**
3. Configure environment variables
4. Deploy!

---

## Common Commands

### Backend
```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Start server
uvicorn main:app --reload

# Run tests
pytest

# Check dependencies
pip list
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

## API Key Setup

### Get Anthropic API Key:
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create new key
5. Copy and paste into `backend/.env`

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

### Get OpenAI API Key (Optional):
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys
4. Create new key
5. Add to `backend/.env`

```env
OPENAI_API_KEY=sk-xxxxx
```

---

## Testing the Complete Flow

### End-to-End Test:

1. **Start servers** (both backend and frontend)

2. **Open browser** to http://localhost:3000

3. **Upload resume**
   - Use `demo/sample_resume.txt`
   - Wait for analysis (~10-15 seconds)

4. **Complete questionnaire**
   - Fill in personality questions
   - Click "Complete Setup"

5. **Generate stories**
   - Should happen automatically
   - Check "Story Bank" tab

6. **Ask question**
   - Click "Ask Question" tab
   - Type: "Tell me about a time you made a mistake"
   - Click "Generate Answer"

7. **Practice**
   - Click "Practice Mode" tab
   - Answer a question
   - Get feedback

✅ If all steps work, you're ready to demo!

---

## Performance Tips

### For Faster Development:

1. **Use sample data** instead of uploading resume each time
2. **Cache API responses** during development
3. **Mock AI calls** for UI testing
4. **Use browser DevTools** to debug

### For Better Demo:

1. **Pre-generate responses** for common questions
2. **Have backup screenshots** if API is slow
3. **Test on fast internet** connection
4. **Close other applications** to free resources

---

## Getting Help

### Resources:
- 📖 Full setup: **SETUP.md**
- 🎯 Demo script: **DEMO_GUIDE.md**
- 🏗️ Architecture: **ARCHITECTURE.md**
- 📊 Project overview: **PROJECT_SUMMARY.md**

### Debugging:
- Check backend logs in terminal
- Check frontend logs in browser console (F12)
- Check API docs at http://localhost:8000/docs
- Review error messages carefully

---

## Success Checklist

Before your demo, verify:

- ✅ Both servers start without errors
- ✅ Can upload and parse resume
- ✅ Personality questionnaire works
- ✅ Stories generate successfully
- ✅ Question answering works
- ✅ Practice mode gives feedback
- ✅ UI looks good on your screen
- ✅ Demo script practiced

---

## You're All Set! 🎉

If you can:
1. ✅ Start both servers
2. ✅ Upload a resume
3. ✅ Generate an answer
4. ✅ Get practice feedback

**You're ready to demo BehavAced!**

Visit http://localhost:3000 and start exploring.

---

**Need help?** Check the other documentation files or review error messages in the terminal.

**Ready to demo?** Read **DEMO_GUIDE.md** for the perfect 5-minute pitch.

**Ready to deploy?** Follow the deployment section in **SETUP.md**.

Good luck! 🚀

