#!/bin/bash

echo "🚀 Setting up EchoLearn..."

# Create environment files
echo "Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "OPENAI_API_KEY=your_openai_api_key_here" > backend/.env
    echo "SIGNALL_API_KEY=your_signall_api_key_here" >> backend/.env
    echo "DATABASE_URL=sqlite:///./echolearn.db" >> backend/.env
    echo "SECRET_KEY=your_secret_key_here_$(openssl rand -hex 32)" >> backend/.env
    echo "ENVIRONMENT=development" >> backend/.env
    echo "✅ Created backend/.env"
else
    echo "⚠️  backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:8000" > frontend/.env
    echo "✅ Created frontend/.env"
else
    echo "⚠️  frontend/.env already exists"
fi

# Setup backend
echo ""
echo "🐍 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Created Python virtual environment"
else
    echo "⚠️  Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Installed Python dependencies"

cd ..

# Setup frontend
echo ""
echo "⚛️  Setting up frontend..."
cd frontend

# Install dependencies
npm install
echo "✅ Installed Node.js dependencies"

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to backend/.env"
echo "2. (Optional) Add SignAll API key to backend/.env for enhanced ASL translation"
echo "3. Start the backend: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Happy learning! 🎓" 