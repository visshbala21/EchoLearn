import openai
import os
import json
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """Transcribe audio using OpenAI Whisper"""
        try:
            with open(audio_file_path, "rb") as audio_file:
                transcript = self.openai_client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file,
                    response_format="text"
                )
            return transcript
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            return ""
    
    async def summarize_text(self, text: str) -> str:
        """Generate a simplified summary of the text"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI tutor helping deaf and hard-of-hearing students. Summarize the following lecture content in clear, simple language. Focus on key concepts and main ideas. Use bullet points for better readability."
                    },
                    {
                        "role": "user",
                        "content": f"Please summarize this lecture content: {text}"
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error summarizing text: {e}")
            return "Unable to generate summary at this time."
    
    async def generate_quiz(self, text: str, num_questions: int = 3) -> List[Dict[str, Any]]:
        """Generate quiz questions from the content"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are creating accessible quiz questions for deaf and hard-of-hearing students. Generate multiple choice questions based on the lecture content. Each question should test understanding of key concepts. Return your response as a JSON array with this format: [{'question': 'Question text?', 'options': ['A', 'B', 'C', 'D'], 'correct_answer': 'A', 'explanation': 'Why this is correct'}]"
                    },
                    {
                        "role": "user",
                        "content": f"Create {num_questions} quiz questions from this content: {text}"
                    }
                ],
                max_tokens=1000,
                temperature=0.5
            )
            
            quiz_data = json.loads(response.choices[0].message.content)
            return quiz_data
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return []
    
    async def get_clarification(self, concept: str, context: str) -> str:
        """Provide clarification for specific concepts"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI tutor helping students understand concepts. Provide clear, visual explanations that would be helpful for deaf and hard-of-hearing learners. Use examples and analogies when possible."
                    },
                    {
                        "role": "user",
                        "content": f"Please explain this concept in simple terms: '{concept}'. Context: {context}"
                    }
                ],
                max_tokens=300,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error getting clarification: {e}")
            return "Unable to provide clarification at this time."

ai_service = AIService() 