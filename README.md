# 🚀 EchoLearn - AI Tutor for the Deaf and Hard of Hearing

EchoLearn is an AI-powered educational platform that converts spoken lectures, videos, and ambient classroom discussions into real-time sign language animations and simplified text summaries, helping deaf and hard-of-hearing students access spoken content equitably.

## 🏆 Hackathon Submission

**Challenge**: Vibe Coding for Social Impact  
**Focus**: Accessibility in Education & AI for Social Good  
**Built**: December 2024  

### 🎯 What We Did

We built a comprehensive AI-powered educational accessibility platform that addresses the significant barriers deaf and hard-of-hearing students face in traditional educational environments. EchoLearn transforms spoken content into multiple accessible formats:

- **Real-time Speech-to-Text Transcription**: Using OpenAI Whisper API for accurate speech recognition
- **Animated Sign Language Translation**: Converting text to ASL with visual avatar demonstrations  
- **AI-Powered Content Summarization**: Simplifying complex lectures using GPT-4
- **Interactive Quiz Generation**: Auto-creating assessments from transcribed content
- **Session Management & Progress Tracking**: Persistent learning history and analytics
- **Accessible UI/UX Design**: Mobile-responsive interface with accessibility features

### 🛠️ How We Did It

**Architecture & Tech Stack:**
- **Frontend**: React 18 + Vite for fast development, TailwindCSS for responsive styling
- **Backend**: FastAPI with SQLite database for session persistence
- **AI Services**: OpenAI Whisper (speech-to-text) + GPT-4 (summarization & quiz generation)
- **Sign Language**: Custom built-in ASL translation system with animated avatar
- **Real-time Communication**: RESTful APIs with error handling and user feedback
- **State Management**: React hooks with session storage and database sync

**Key Implementation Features:**
- Audio recording with MediaRecorder API and file upload support
- Robust error handling with user-friendly feedback (React Hot Toast)
- Session-based learning with progress tracking and history
- Responsive design with accessibility considerations (keyboard navigation, high contrast)
- Production-ready deployment with Docker support and environment configuration

### 🚧 Challenges We Faced

**1. Audio Processing & Browser Compatibility**
- MediaRecorder API behaves differently across browsers (Chrome, Firefox, Safari)
- Managing audio format compatibility and file size optimization
- Implementing proper cleanup of audio resources to prevent memory leaks

**2. Real-time ASL Translation System**
- Building a reliable fallback system when external ASL APIs are unavailable
- Creating smooth animations for sign language demonstrations
- Implementing proper timing and speed controls for sign playback

**3. AI Service Integration & Error Handling**
- Managing OpenAI API rate limits and error responses gracefully
- Handling transcription failures and providing meaningful user feedback
- Ensuring consistent data flow between transcription, ASL translation, and quiz generation

**4. Session State Management**
- Synchronizing frontend state with backend database sessions
- Handling navigation between different app sections while preserving session data
- Managing loading states for multiple concurrent AI operations (transcription, summary, quiz)

**5. Complex UI State Coordination**
- Coordinating multiple tabs (Transcribe, Results, Quiz, History) with shared state
- Implementing proper loading indicators for different async operations
- Managing form data submission with both query parameters and form data

**6. Production Deployment Considerations**
- Setting up proper environment variable management across development and production
- Implementing CORS configuration for cross-origin requests
- Creating reliable setup scripts for different operating systems and Python environments

## 🌟 Features

- **Real-time Speech-to-Text**: Live audio transcription using OpenAI Whisper
- **Text Summarization**: AI-powered content simplification using GPT-4
- **Sign Language Translation**: Text-to-ASL conversion with visual avatar animations
- **Interactive Quizzes**: Auto-generated quizzes from lecture content with multiple-choice questions
- **Session Management**: Persistent learning history with detailed session tracking
- **Progress Analytics**: Track learning progress and identify areas needing clarification
- **Modern Accessible UI**: Clean, responsive interface with accessibility features
- **Multi-format Support**: Handle both live recording and audio file uploads

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + Framer Motion
- **Backend**: FastAPI + SQLite + SQLAlchemy
- **AI Services**: OpenAI (Whisper + GPT-4)
- **Sign Language**: Built-in ASL translation system with animated avatar
- **Additional Libraries**: Axios, React Router, React Hot Toast, Heroicons, Lucide React

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (3.9+ recommended)
- Node.js 16+ (18+ recommended) 
- OpenAI API key ([Get yours here](https://platform.openai.com/api-keys))

### Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd EchoLearn

# Run the setup script
chmod +x setup.sh
./setup.sh

# Add your OpenAI API key to backend/.env
# Edit the file and replace "your_openai_api_key_here" with your actual key

# Start both frontend and backend
chmod +x start.sh
./start.sh
```

### Manual Setup

#### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

#### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Variables

Create `.env` files in both directories:

**backend/.env**:
```env
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./echolearn.db
SECRET_KEY=your_secret_key_here
ENVIRONMENT=development
```

**frontend/.env**:
```env
VITE_API_URL=http://localhost:8000
```

### Running the Application

**Option 1: Using start script**
```bash
./start.sh
```

**Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
EchoLearn/
├── backend/                 # FastAPI backend
│   ├── main.py             # API endpoints & WebSocket handlers
│   ├── database.py         # SQLAlchemy models & database setup
│   ├── requirements.txt    # Python dependencies
│   ├── services/           # AI service modules
│   │   ├── ai_service.py   # OpenAI integration
│   │   └── sign_language_service.py  # ASL translation
│   └── .env               # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── AudioRecorder.jsx
│   │   │   ├── ASLAvatar.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   ├── pages/          # Main application pages
│   │   │   ├── LearningSession.jsx
│   │   │   └── SessionHistory.jsx
│   │   ├── services/       # API service layer
│   │   │   └── api.js
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Application entry point
│   ├── package.json        # Node.js dependencies
│   └── .env               # Environment variables
├── setup.sh               # Automated setup script
├── start.sh               # Application launcher
└── README.md              # This file
```

## 🎯 Usage Guide

1. **Start Learning Session**: Click "Start New Session" to begin
2. **Record Audio**: Use microphone or upload audio files (MP3, WAV, M4A)
3. **View Transcription**: See real-time speech-to-text conversion
4. **Watch ASL Translation**: View animated sign language demonstrations
5. **Get AI Summary**: Click "Generate Summary" for AI-powered content simplification
6. **Take Quizzes**: Test understanding with auto-generated multiple-choice questions
7. **Review History**: Access past sessions and track learning progress

## 🔑 API Key Setup

1. **OpenAI API**: 
   - Go to https://platform.openai.com/api-keys
   - Create an account and generate a new API key
   - Add to `backend/.env`: `OPENAI_API_KEY=sk-your-key-here`
   - **Note**: Requires paid OpenAI account for production use

## 🎨 Accessibility Features

- **Keyboard Navigation**: Full app navigation without mouse
- **High Contrast Mode**: Improved visibility for visually impaired users
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Visual Feedback**: Clear indicators for all user interactions
- **Error Handling**: Graceful degradation with helpful error messages

## 🚀 Deployment

### Local Development
```bash
./start.sh
```

### Production Deployment
See `DEPLOYMENT.md` for detailed production deployment instructions including:
- Docker containerization
- Cloud platform deployment (Heroku, Railway, etc.)
- Environment variable configuration
- Database migration
- SSL certificate setup

## 🧪 Testing

Run the basic test suite:
```bash
python test_basic.py
```

For manual testing:
1. Test audio recording and file upload
2. Verify transcription accuracy with OpenAI Whisper
3. Check ASL avatar animations
4. Test AI summary generation
5. Validate quiz question generation and display

## 🤝 Contributing

This project was built for the Vibe Coding for Social Impact Challenge. For future development:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Impact

EchoLearn addresses real accessibility challenges in education by providing:
- **Immediate Impact**: Usable by deaf/HoH students today
- **Scalable Solution**: Cloud-deployable for institutional use  
- **Cost-Effective**: Uses existing AI APIs efficiently
- **Open Source**: Available for community improvement and deployment

**Social Impact Metrics:**
- Reduces communication barriers in educational settings
- Provides equal access to spoken content and lectures
- Enables independent learning for deaf and hard-of-hearing students
- Supports multiple learning modalities (visual, textual, interactive) 