# ⚡ EchoLearn Quick Start Guide

## 🚨 Having Dependency Issues? Try This!

If you're encountering Python package installation errors, follow this streamlined approach:

### Option 1: Simplified Setup (Recommended)
```bash
# Use the simplified setup script
./setup_simple.sh

# Add your OpenAI API key
echo "OPENAI_API_KEY=your_actual_api_key_here" > backend/.env
echo "DATABASE_URL=sqlite:///./echolearn.db" >> backend/.env
echo "SECRET_KEY=your_secret_key_$(date +%s)" >> backend/.env
echo "ENVIRONMENT=development" >> backend/.env

# Start the app
./start.sh
```

### Option 2: Manual Setup (If scripts fail)

#### Backend Setup:
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install core dependencies only
pip install --upgrade pip
pip install fastapi uvicorn python-multipart openai python-dotenv sqlalchemy

# Create environment file
cat > .env << EOF
OPENAI_API_KEY=your_actual_api_key_here
DATABASE_URL=sqlite:///./echolearn.db
SECRET_KEY=your_secret_key_$(date +%s)
ENVIRONMENT=development
EOF

# Start backend
python -m uvicorn main:app --reload
```

#### Frontend Setup (in new terminal):
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start frontend
npm run dev
```

### Option 3: Docker Setup (If you have Docker)
```bash
# Create simple Dockerfile for backend
cat > backend/Dockerfile << EOF
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

# Run with docker-compose (create docker-compose.yml if needed)
```

## 🔑 Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Click "Create new secret key"
4. Copy the key and add it to `backend/.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

## 🧪 Test Everything Works

```bash
# Test backend (in new terminal)
curl http://localhost:8000/health

# Test frontend
# Open http://localhost:5173 in browser
```

## 🎯 Core Features to Demo

1. **Audio Recording**: Click microphone → record → transcribe
2. **File Upload**: Upload audio file → get transcription
3. **ASL Translation**: See animated avatar demonstrate signs
4. **AI Summary**: Generate summaries of content
5. **Quiz Generation**: Create quizzes from transcribed content

## 🚨 Troubleshooting

### Backend Won't Start?
- Check Python version: `python3 --version` (needs 3.8+)
- Try minimal install: `pip install fastapi uvicorn openai`
- Check OpenAI API key is set correctly

### Frontend Won't Start?
- Check Node.js: `node --version` (needs 16+)
- Clear cache: `npm clean-install`
- Try: `npm run dev --force`

### API Connection Issues?
- Verify backend is running on port 8000
- Check CORS settings in main.py
- Ensure .env files are created correctly

### Audio Recording Not Working?
- Check browser microphone permissions
- Use file upload as alternative
- Test with provided sample audio files

## 📱 Demo Ready in 5 Minutes

1. **Setup**: `./setup_simple.sh`
2. **API Key**: Add to `backend/.env`
3. **Start**: `./start.sh`
4. **Test**: Record "Hello world" → see ASL translation
5. **Demo**: You're ready to present!

## 🔥 Quick Demo Script

```
"Hi! This is EchoLearn - an AI tutor for deaf students.
Watch this: [Record audio] → [Shows transcription] → [ASL avatar] → [Generate summary]
This makes education accessible for 300 million deaf people worldwide!"
```

## 💪 Minimum Viable Demo

Even if some features don't work perfectly:
- ✅ Show the beautiful UI
- ✅ Demonstrate ASL avatar (works offline)
- ✅ Show session management
- ✅ Explain the vision and impact
- ✅ Highlight accessibility features

## 🎯 Remember: You're Solving a Real Problem!

- 300M+ deaf/hard-of-hearing people globally
- Educational barriers in spoken environments  
- This app makes learning accessible
- Real social impact with AI innovation

Good luck! You've got this! 🚀 