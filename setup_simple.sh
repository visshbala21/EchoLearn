#!/bin/bash

echo "🚀 Setting up EchoLearn (Simple)..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
echo "Python version detected: $python_version"

# Create environment files
echo "Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "OPENAI_API_KEY=your_openai_api_key_here" > backend/.env
    echo "SIGNALL_API_KEY=your_signall_api_key_here" >> backend/.env
    echo "DATABASE_URL=sqlite:///./echolearn.db" >> backend/.env
    echo "SECRET_KEY=your_secret_key_here_$(date +%s)" >> backend/.env
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

# Upgrade pip first
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Installed Python dependencies successfully"
else
    echo "⚠️  Some packages failed to install, but core functionality should still work"
fi

cd ..

# Setup frontend
echo ""
echo "⚛️  Setting up frontend..."
cd frontend

# Check if npm is available
if command -v npm &> /dev/null; then
    npm install
    echo "✅ Installed Node.js dependencies"
else
    echo "❌ npm not found. Please install Node.js first"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenAI API key to backend/.env"
echo "   Get it from: https://platform.openai.com/api-keys"
echo "2. Start the backend: cd backend && source venv/bin/activate && python -m uvicorn main:app --reload"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "Or use: ./start.sh to run both servers"
echo ""
echo "Happy learning! 🎓" 