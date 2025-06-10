from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Float, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = "sqlite:///./echolearn.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class LearningSession(Base):
    __tablename__ = "learning_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    transcription = Column(Text)
    summary = Column(Text)
    sign_language_data = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    duration = Column(Float)  # in seconds
    
class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    question = Column(Text)
    options = Column(Text)  # JSON string of options
    correct_answer = Column(String)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, index=True)
    quiz_id = Column(Integer, index=True)
    user_answer = Column(String)
    is_correct = Column(Boolean)
    time_taken = Column(Float)  # in seconds
    created_at = Column(DateTime, default=datetime.utcnow)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 