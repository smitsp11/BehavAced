# BehavAced Architecture

## System Overview

BehavAced is built as a modern full-stack web application with AI at its core. The system is designed to be scalable, maintainable, and demo-ready.

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI/LLM**: Anthropic Claude 3.5 Sonnet
- **Voice**: OpenAI Whisper (optional)
- **Storage**: In-memory (MVP), Supabase (Production)
- **File Processing**: PyPDF2, python-docx

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: Custom UI components + Radix UI primitives
- **State Management**: React hooks (useState, useEffect)

### Infrastructure (Production)
- **Backend Hosting**: Railway / Render / AWS Lambda
- **Frontend Hosting**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                   │
│  ┌─────────────┬─────────────┬──────────────┬──────────┐   │
│  │ Onboarding  │  Dashboard  │  Practice    │  Stories │   │
│  │   Flow      │             │    Mode      │   Bank   │   │
│  └─────────────┴─────────────┴──────────────┴──────────┘   │
│                            │                                 │
│                       API Client                             │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTPS/REST
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    API Routes                         │  │
│  │  /profile  /stories  /questions  /answers  /practice │  │
│  └───────────────┬──────────────────────────────────────┘  │
│                  │                                           │
│  ┌───────────────▼──────────────────────────────────────┐  │
│  │                Service Layer                          │  │
│  │  ┌──────────┬──────────┬──────────┬──────────────┐  │  │
│  │  │   AI     │  File    │  Voice   │   Storage    │  │  │
│  │  │ Service  │ Service  │ Service  │   Service    │  │  │
│  │  └────┬─────┴──────────┴──────────┴──────┬───────┘  │  │
│  └───────┼──────────────────────────────────┼──────────┘  │
│          │                                   │              │
│  ┌───────▼────────┐                  ┌──────▼──────────┐  │
│  │  AI Prompts    │                  │  Data Storage   │  │
│  │   Library      │                  │  (In-memory)    │  │
│  └───────┬────────┘                  └─────────────────┘  │
└──────────┼──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌─────────────────┬─────────────────┬──────────────────┐  │
│  │  Anthropic      │  OpenAI         │  Supabase        │  │
│  │  Claude API     │  Whisper API    │  (Future)        │  │
│  └─────────────────┴─────────────────┴──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Onboarding Flow

```
User uploads resume
    ↓
Frontend converts to base64
    ↓
POST /api/profile/ingest
    ↓
File Service extracts text
    ↓
AI Service analyzes resume → Claude API
    ↓
Extract experiences & create user profile
    ↓
Store in memory (user_id generated)
    ↓
Return user_id to frontend
    ↓
User completes personality questionnaire
    ↓
POST /api/profile/personality
    ↓
AI Service analyzes personality → Claude API
    ↓
Update user profile with communication style
    ↓
POST /api/stories/generate
    ↓
AI Service transforms experiences into stories → Claude API
    ↓
Store story bank
    ↓
Redirect to dashboard
```

### 2. Question Answering Flow

```
User enters question
    ↓
POST /api/answers/generate
    ↓
Load user profile + stories
    ↓
AI Service routes question → Claude API
    ├─ Detect competency category
    ├─ Match to best story
    └─ Calculate confidence score
    ↓
AI Service generates answer → Claude API
    ├─ Use matched story
    ├─ Apply user's communication style
    └─ Create STAR-formatted response
    ↓
Return answer + routing metadata
    ↓
Display to user
```

### 3. Practice & Feedback Flow

```
User types/records answer
    ↓
POST /api/practice/score
    ↓
(Optional) Voice Service transcribes → Whisper API
    ↓
Analyze speech patterns (filler words, pacing)
    ↓
AI Service scores transcript → Claude API
    ├─ Clarity score
    ├─ Structure analysis
    ├─ Confidence assessment
    └─ Missing elements detection
    ↓
AI Service generates improved version → Claude API
    ├─ Fix structure issues
    ├─ Enhance clarity
    └─ Maintain user's voice
    ↓
Store practice attempt
    ↓
Return scores + improved answer + coaching tips
    ↓
Display feedback to user
```

---

## AI Reasoning Pipeline

BehavAced's AI system uses a multi-step reasoning approach:

### 1. Profile Creation
```
Resume Text
    ↓
[Resume Analysis Prompt]
    → Extract experiences
    → Identify themes
    → Assess story potential
    ↓
[Personality Analysis Prompt]
    → Detect communication style
    → Identify linguistic patterns
    → Profile strengths/weaknesses
    ↓
Unified User Profile
```

### 2. Story Generation
```
Raw Experiences + Profile
    ↓
[Story Extraction Prompt]
    → Transform into STAR format
    → Create multiple versions
    → Match user's voice
    → Tag competencies
    ↓
Story Bank (4-8 stories)
```

### 3. Question Routing
```
Question + Story Bank
    ↓
[Question Routing Prompt]
    → Classify competency
    → Semantic matching
    → Rank stories
    → Calculate confidence
    ↓
Best Story Match + Reasoning
```

### 4. Answer Generation
```
Question + Story + Profile
    ↓
[Answer Generation Prompt]
    → Apply STAR structure
    → Use user's vocabulary
    → Match tone/pacing
    → Estimate speaking time
    ↓
Personalized Answer
```

### 5. Practice Feedback
```
Transcript + Expected Story
    ↓
[Scoring Prompt]
    → Evaluate clarity
    → Check structure
    → Assess confidence
    → Identify gaps
    ↓
[Improvement Prompt]
    → Rewrite with fixes
    → Maintain voice
    → Add missing elements
    ↓
Scores + Improved Answer + Tips
```

---

## Prompt Engineering Strategy

### Key Principles

1. **System Prompts Define Role**
   - Clear role definition
   - Expected output format
   - Domain expertise

2. **User Prompts Provide Context**
   - Complete information
   - Specific instructions
   - JSON schema requirements

3. **Output Parsing**
   - Structured JSON responses
   - Fallback handling
   - Validation

### Example Prompt Structure

```python
SYSTEM_PROMPT = """
You are an expert [ROLE].
You understand [DOMAIN KNOWLEDGE].
Output must be valid JSON.
"""

USER_PROMPT = """
[TASK DESCRIPTION]

Input:
{input_data}

Return JSON:
{
    "field1": "value",
    "field2": ["list"]
}
"""
```

---

## API Endpoints

### Profile Management
- `POST /api/profile/ingest` - Upload & analyze resume
- `POST /api/profile/personality` - Analyze personality
- `GET /api/profile/{user_id}` - Get user profile

### Story Management
- `POST /api/stories/generate/{user_id}` - Generate stories
- `GET /api/stories/{user_id}` - Get all stories
- `GET /api/stories/{user_id}/{story_id}` - Get specific story

### Question & Answers
- `POST /api/questions/route` - Route question to story
- `POST /api/answers/generate` - Generate answer
- `GET /api/questions/categories` - List categories

### Practice & Feedback
- `POST /api/practice/score` - Score practice attempt
- `GET /api/practice/history/{user_id}` - Get history

### Practice Plans
- `POST /api/plans/generate` - Generate plan
- `GET /api/plans/{user_id}` - Get current plan
- `POST /api/plans/{user_id}/progress` - Update progress

---

## Data Models

### User Profile
```python
{
    "user_id": "uuid",
    "personality_traits": ["trait1", "trait2"],
    "communication_style": {
        "vocabulary_level": "simple|moderate|advanced",
        "tone": "formal|conversational",
        ...
    },
    "strengths": ["strength1"],
    "weaknesses": ["weakness1"],
    "confidence_level": 1-10,
    "experience_level": "student|entry|mid|senior"
}
```

### Story
```python
{
    "story_id": "uuid",
    "title": "Story Title",
    "situation": "...",
    "task": "...",
    "actions": ["action1", "action2"],
    "result": "...",
    "themes": ["leadership", "conflict"],
    "competencies": ["problem-solving"],
    "star_version": "full answer text",
    "compressed_version": "shorter version"
}
```

### Practice Attempt
```python
{
    "attempt_id": "uuid",
    "question": "...",
    "transcript": "...",
    "scores": {
        "clarity": 0-100,
        "structure": 0-100,
        ...
    },
    "filler_words": {"um": 3, "like": 5},
    "improvements": ["suggestion1"]
}
```

---

## Security Considerations

### Current (MVP)
- No authentication (demo only)
- In-memory storage (non-persistent)
- Frontend API key exposure acceptable for demo

### Production Requirements
- **Authentication**: NextAuth.js or Clerk
- **Authorization**: Role-based access control
- **API Keys**: Stored server-side only
- **Rate Limiting**: Prevent abuse
- **Data Encryption**: At rest and in transit
- **Input Validation**: Sanitize all inputs
- **CORS**: Restrict to known origins

---

## Scalability Considerations

### Current Limitations
- In-memory storage (single server)
- Synchronous API calls
- No caching
- No load balancing

### Production Improvements
1. **Database**: Move to Supabase/PostgreSQL
2. **Caching**: Redis for user profiles and stories
3. **Queue System**: Celery for background tasks
4. **CDN**: Cache static assets
5. **Rate Limiting**: Protect API endpoints
6. **Monitoring**: Application and AI usage metrics

---

## Testing Strategy

### Unit Tests
- Service layer functions
- Prompt formatting
- Data validation

### Integration Tests
- API endpoints
- AI service interactions
- File processing

### E2E Tests
- Complete user flows
- Onboarding to practice

### Performance Tests
- API response times
- Concurrent users
- AI call optimization

---

## Deployment Architecture

### Development
```
Local Machine
├── Backend: localhost:8000
└── Frontend: localhost:3000
```

### Production
```
Vercel (Frontend)
    ↓ API calls
Railway/Render (Backend)
    ↓ AI calls
Claude API
    ↓ Storage
Supabase (Database)
```

---

## Monitoring & Observability

### Metrics to Track
- API response times
- AI call latency
- Error rates
- User conversion funnel
- Story generation success rate
- Practice attempt scores over time

### Tools (Future)
- Sentry for error tracking
- Anthropic dashboard for AI usage
- Custom analytics dashboard

---

## Future Enhancements

### Phase 1 (Post-MVP)
- Real voice recording & transcription
- Practice plan generation
- Progress tracking dashboard

### Phase 2
- Company-specific answer optimization
- Mock interview simulator
- Mobile app (React Native)

### Phase 3
- B2B SaaS for career centers
- Coach/mentor collaboration features
- Advanced analytics and insights

---

## Development Workflow

### Local Development
1. Start backend: `uvicorn main:app --reload`
2. Start frontend: `npm run dev`
3. Make changes (hot reload enabled)
4. Test manually or with automated tests

### Git Workflow
1. Create feature branch
2. Develop & test locally
3. Commit with descriptive messages
4. Push and create PR
5. Review and merge

### Deployment
1. Backend: Push to Railway/Render
2. Frontend: Push to Vercel
3. Environment variables configured in platforms
4. Automatic deployment on merge to main

---

## Key Design Decisions

### Why FastAPI?
- Fast and modern Python framework
- Automatic API documentation
- Native async support
- Type safety with Pydantic

### Why Next.js?
- React framework with SSR/SSG
- Great developer experience
- Vercel deployment integration
- Built-in routing and API routes

### Why Claude?
- Superior reasoning capabilities
- Long context window (100K+ tokens)
- Better at maintaining consistent voice
- Strong instruction following

### Why In-Memory Storage for MVP?
- Fast to build
- No database setup required
- Perfect for demos
- Easy to replace with real DB later

---

This architecture is designed to be demo-ready while maintaining a clear path to production scalability.

