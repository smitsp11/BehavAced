#!/bin/bash

# BehavAced Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting BehavAced..."
echo ""

# Check if .env exists in backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  backend/.env not found!"
    echo "Creating from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env and add your ANTHROPIC_API_KEY"
    echo "Get your key from: https://console.anthropic.com/"
    exit 1
fi

# Check if .env.local exists in frontend
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local from template..."
    cp frontend/.env.example frontend/.env.local
fi

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "📥 Downloading spaCy English model..."
    python -m spacy download en_core_web_sm
    cd ..
    echo "✅ Backend dependencies installed"
fi

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "✨ Starting servers..."
echo ""
echo "📡 Backend will run on: http://localhost:8000"
echo "🎨 Frontend will run on: http://localhost:3000"
echo "📚 API Docs available at: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start backend in background
cd backend
source venv/bin/activate
uvicorn main:app --reload &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend in background
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup INT

# Keep script running
wait

