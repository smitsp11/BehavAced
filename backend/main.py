"""
BehavAced Backend - Main Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import profile, stories, questions, answers, practice, plans
from app.core.config import settings

app = FastAPI(
    title="BehavAced API",
    description="AI-driven behavioral interview cognition engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(stories.router, prefix="/api/stories", tags=["stories"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(answers.router, prefix="/api/answers", tags=["answers"])
app.include_router(practice.router, prefix="/api/practice", tags=["practice"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])


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

