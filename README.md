# BehavAced

An AI-driven behavioral interview cognition engine that helps users prepare, practice, and perfect their interview responses.

## Overview

BehavAced is not just a practice tool — it's a reasoning layer that extends human cognition for behavioral interviews. It understands your personality, extracts your stories, and helps you articulate your experiences with clarity and confidence.

## Key Features

- **Cognitive Profile Engine**: Analyzes resume, writing samples, and voice to understand your unique communication style
- **Story Bank**: Extracts and organizes your experiences into a searchable knowledge graph
- **Smart Question Router**: Matches any behavioral question to your best story
- **Personalized Answer Generator**: Creates responses in YOUR authentic voice
- **Voice Practice & Feedback**: Real-time scoring on clarity, pacing, structure, and confidence
- **Adaptive Practice Plans**: Personalized daily drills based on your weaknesses

## Tech Stack

### Backend
- **FastAPI**: High-performance Python API framework
- **Anthropic Claude**: AI reasoning and generation
- **Supabase/PostgreSQL**: User data and story storage
- **OpenAI Whisper**: Voice transcription

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Modern styling
- **Shadcn/ui**: Beautiful component library

## Project Structure

```
BehavAced/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── core/        # Config and settings
│   │   ├── models/      # Data models
│   │   ├── services/    # Business logic
│   │   └── prompts/     # AI prompt templates
│   ├── requirements.txt
│   └── main.py
├── frontend/            # Next.js application
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/        # Utilities
│   │   └── types/      # TypeScript types
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `.env` files in both backend and frontend directories:

**backend/.env**:
```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**frontend/.env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## MVP Demo Flow

1. **Upload Resume** → System generates personality model and story bank
2. **Ask Behavioral Question** → AI selects best story and generates answer
3. **Practice Speaking** → User records answer, gets real-time feedback
4. **Get Improved Version** → AI rewrites answer based on your style
5. **Receive Practice Plan** → Personalized drills for continuous improvement

## Development Roadmap

- [x] Project setup and architecture
- [ ] Core API endpoints
- [ ] AI prompt engineering
- [ ] Frontend UI components
- [ ] Voice recording and transcription
- [ ] Demo data and presentation flow

## License

MIT

