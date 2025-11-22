"""
BehavAced Backend - Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, stories, questions, answers, practice, plans
from app.core.config import settings

# Import dev routes only in development
if settings.ENVIRONMENT == "development":
    from app.api import dev

app = FastAPI(
    title="BehavAced API",
    description="AI-driven behavioral interview cognition engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3005",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3005",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import new Phase 1 routers
from app.api import demo, onboarding, story_brain, personalized_answers

# Include routers
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(stories.router, prefix="/api/stories", tags=["stories"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(practice.router, prefix="/api/practice", tags=["practice"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])

# Phase 1 MVP routers
app.include_router(demo.router, prefix="/api/demo", tags=["demo"])
app.include_router(onboarding.router, prefix="/api/onboarding", tags=["onboarding"])
app.include_router(story_brain.router, prefix="/api/story-brain", tags=["story-brain"])
app.include_router(personalized_answers.router, prefix="/api/answers", tags=["personalized-answers"])

# Include dev routes only in development
if settings.ENVIRONMENT == "development":
    app.include_router(dev.router, prefix="/api/dev", tags=["dev"])


@app.get("/")
async def root():
    return {
        "message": "BehavAced API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

