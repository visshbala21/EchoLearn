from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import tempfile
import json
from datetime import datetime
from typing import List, Dict, Any

from database import get_db, create_tables, LearningSession, Quiz, UserProgress
from services.ai_service import ai_service
from services.sign_language_service import sign_language_service

app = FastAPI(title="EchoLearn API", description="AI Tutor for the Deaf and Hard of Hearing")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    print("EchoLearn API started successfully!")

# Static files for serving videos and assets
app.mount("/static", StaticFiles(directory="static"), name="static")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Welcome to EchoLearn API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/sessions/")
async def create_session(title: str = "New Learning Session", db: Session = Depends(get_db)):
    """Create a new learning session"""
    session = LearningSession(title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "title": session.title, "created_at": session.created_at}

@app.get("/sessions/")
async def get_sessions(db: Session = Depends(get_db)):
    """Get all learning sessions"""
    sessions = db.query(LearningSession).order_by(LearningSession.created_at.desc()).all()
    return {"sessions": sessions}

@app.get("/sessions/{session_id}")
async def get_session(session_id: int, db: Session = Depends(get_db)):
    """Get a specific learning session"""
    session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/transcribe/")
async def transcribe_audio(file: UploadFile = File(...), session_id: int = None, db: Session = Depends(get_db)):
    """Transcribe uploaded audio file"""
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Transcribe the audio
        transcription = await ai_service.transcribe_audio(temp_file_path)
        
        # Generate ASL translation
        asl_data = await sign_language_service.translate_to_asl(transcription)
        
        # Update session if provided
        if session_id:
            session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
            if session:
                session.transcription = transcription
                session.sign_language_data = json.dumps(asl_data)
                db.commit()
        
        return {
            "transcription": transcription,
            "asl_translation": asl_data,
            "session_id": session_id
        }
    
    finally:
        # Clean up temporary file
        os.unlink(temp_file_path)

@app.post("/summarize/")
async def summarize_content(session_id: int, db: Session = Depends(get_db)):
    """Generate summary for a learning session"""
    session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.transcription:
        raise HTTPException(status_code=400, detail="No transcription found for this session")
    
    # Generate summary
    summary = await ai_service.summarize_text(session.transcription)
    
    # Update session
    session.summary = summary
    db.commit()
    
    return {"summary": summary, "session_id": session_id}

@app.post("/quiz/generate/")
async def generate_quiz(session_id: int, num_questions: int = 3, db: Session = Depends(get_db)):
    """Generate quiz questions from session content"""
    session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not session.transcription:
        raise HTTPException(status_code=400, detail="No transcription found for this session")
    
    # Generate quiz questions
    quiz_data = await ai_service.generate_quiz(session.transcription, num_questions)
    
    # Save quiz questions to database
    quiz_ids = []
    for q in quiz_data:
        quiz = Quiz(
            session_id=session_id,
            question=q['question'],
            options=json.dumps(q['options']),
            correct_answer=q['correct_answer'],
            explanation=q['explanation']
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        quiz_ids.append(quiz.id)
    
    return {"quiz_questions": quiz_data, "quiz_ids": quiz_ids, "session_id": session_id}

@app.post("/quiz/answer/")
async def submit_quiz_answer(
    quiz_id: int, 
    user_answer: str, 
    time_taken: float, 
    db: Session = Depends(get_db)
):
    """Submit answer to a quiz question"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz question not found")
    
    is_correct = user_answer == quiz.correct_answer
    
    # Save user progress
    progress = UserProgress(
        session_id=quiz.session_id,
        quiz_id=quiz_id,
        user_answer=user_answer,
        is_correct=is_correct,
        time_taken=time_taken
    )
    db.add(progress)
    db.commit()
    
    return {
        "is_correct": is_correct,
        "correct_answer": quiz.correct_answer,
        "explanation": quiz.explanation,
        "quiz_id": quiz_id
    }

@app.get("/quiz/{session_id}")
async def get_quiz_questions(session_id: int, db: Session = Depends(get_db)):
    """Get all quiz questions for a session"""
    quizzes = db.query(Quiz).filter(Quiz.session_id == session_id).all()
    return {"quiz_questions": quizzes, "session_id": session_id}

@app.post("/clarify/")
async def get_clarification(concept: str, session_id: int, db: Session = Depends(get_db)):
    """Get AI clarification for a specific concept"""
    session = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    context = session.transcription if session else ""
    
    clarification = await ai_service.get_clarification(concept, context)
    
    return {"clarification": clarification, "concept": concept}

@app.post("/asl/translate/")
async def translate_to_asl(text: str):
    """Translate text to ASL"""
    asl_data = await sign_language_service.translate_to_asl(text)
    return asl_data

@app.get("/progress/{session_id}")
async def get_user_progress(session_id: int, db: Session = Depends(get_db)):
    """Get user progress for a session"""
    progress = db.query(UserProgress).filter(UserProgress.session_id == session_id).all()
    
    # Calculate statistics
    total_questions = len(progress)
    correct_answers = sum(1 for p in progress if p.is_correct)
    accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    avg_time = sum(p.time_taken for p in progress) / total_questions if total_questions > 0 else 0
    
    return {
        "session_id": session_id,
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "accuracy": accuracy,
        "average_time": avg_time,
        "progress_details": progress
    }

@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "audio_chunk":
                # Handle real-time audio processing
                await manager.send_personal_message(
                    json.dumps({"type": "processing", "message": "Processing audio..."}),
                    websocket
                )
            elif message["type"] == "text_input":
                # Handle real-time text translation
                text = message["text"]
                asl_data = await sign_language_service.translate_to_asl(text)
                await manager.send_personal_message(
                    json.dumps({"type": "asl_translation", "data": asl_data}),
                    websocket
                )
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 