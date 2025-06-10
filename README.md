# 🚀 EchoLearn - AI Tutor for the Deaf and Hard of Hearing

EchoLearn is an AI-powered educational platform that converts spoken lectures, videos, and ambient classroom discussions into real-time sign language animations and simplified text summaries, helping deaf and hard-of-hearing students access spoken content equitably.

## 🌟 Features

- **Real-time Speech-to-Text**: Live audio transcription using OpenAI Whisper
- **Text Summarization**: AI-powered content simplification using GPT-4
- **Sign Language Translation**: Text-to-ASL conversion with visual avatar
- **Interactive Quizzes**: Auto-generated quizzes from lecture content
- **Personalized Learning**: AI identifies areas needing clarification
- **Modern UI**: Clean, accessible interface built with React

## 🛠️ Tech Stack

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: FastAPI + SQLite
- **AI Services**: OpenAI (Whisper + GPT-4)
- **Sign Language**: Built-in ASL translation system
- **Real-time**: WebSocket for live updates

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

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
OPENAI_API_KEY=your_openai_api_key_here
```

**frontend/.env**:
```
VITE_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
EchoLearn/
├── backend/          # FastAPI backend
│   ├── main.py       # API endpoints
│   ├── models/       # Database models
│   ├── services/     # AI services
│   └── database.py   # Database setup
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── public/
└── docs/            # Documentation
```

## 🎯 Usage

1. **Start Learning Session**: Click "Start Session" to begin audio capture
2. **Real-time Transcription**: Speak and see live text + ASL translation
3. **Get Summaries**: Click "Summarize" for AI-generated content summaries
4. **Take Quizzes**: Test understanding with auto-generated quizzes
5. **Review Progress**: Track learning progress and areas for improvement

## 🔑 API Keys Setup

1. **OpenAI API**: Get your key from https://platform.openai.com/

## 🎨 Accessibility Features

- High contrast mode
- Keyboard navigation
- Screen reader compatibility
- Adjustable text sizes
- Visual feedback for all interactions

## 🏆 Hackathon Notes

This project was built for the Vibe Coding for Social Impact Challenge, focusing on accessibility in education and social impact through technology.

## 📝 License

MIT License - see LICENSE file for details 