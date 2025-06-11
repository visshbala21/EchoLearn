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
            # Check if we have valid text content
            if not text or text.strip() == "":
                return "No content available to summarize. Please ensure you have transcribed audio first."
            
            # Check for API key
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key or api_key.strip() == "":
                return "AI service is currently unavailable. Please try again later."
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an AI tutor helping deaf and hard-of-hearing students. Summarize the following lecture content in clear, simple language. Focus on key concepts and main ideas. Use bullet points for better readability. Be specific and helpful."
                    },
                    {
                        "role": "user",
                        "content": f"Please summarize this lecture content: {text}"
                    }
                ],
                max_tokens=500,
                temperature=0.3,
                timeout=30
            )
            
            summary = response.choices[0].message.content
            
            # Ensure we have a valid summary
            if not summary or summary.strip() == "":
                return "Unable to generate a meaningful summary from the provided content."
                
            return summary
            
        except Exception as e:
            print(f"Error summarizing text: {e}")
            # Provide a more helpful fallback summary
            if text and len(text) > 50:
                return f"Summary generation failed, but here are the key points from your content:\n\n• Content length: {len(text)} characters\n• Main topic appears to be educational content\n• Consider regenerating the summary or checking your connection."
            else:
                return "Unable to generate summary. Please ensure you have sufficient transcribed content and try again."
    
    async def generate_quiz(self, text: str, num_questions: int = 3) -> List[Dict[str, Any]]:
        """Generate quiz questions from the content"""
        print(f"Generating {num_questions} quiz questions from text: {text[:100]}...")
        
        # Always ensure we have fallback questions available
        fallback_quiz = self._generate_fallback_quiz(text, num_questions)
        
        try:
            # Only try OpenAI if we have an API key
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key or api_key.strip() == "":
                print("No OpenAI API key found, using fallback quiz")
                return fallback_quiz
                
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
                temperature=0.5,
                timeout=30  # Add timeout
            )
            
            raw_response = response.choices[0].message.content
            print(f"OpenAI raw response: {raw_response[:200]}...")
            
            # Clean the response - remove markdown formatting if present
            cleaned_response = raw_response.strip()
            if cleaned_response.startswith('```json'):
                cleaned_response = cleaned_response[7:]
            if cleaned_response.endswith('```'):
                cleaned_response = cleaned_response[:-3]
            cleaned_response = cleaned_response.strip()
            
            quiz_data = json.loads(cleaned_response)
            
            # Validate the quiz data
            if not isinstance(quiz_data, list) or len(quiz_data) == 0:
                print("Invalid quiz data format, using fallback")
                return fallback_quiz
                
            # Validate each question has required fields
            validated_questions = []
            for q in quiz_data:
                if all(key in q for key in ['question', 'options', 'correct_answer']):
                    validated_questions.append(q)
                    
            if len(validated_questions) > 0:
                print(f"Successfully parsed {len(validated_questions)} quiz questions")
                return validated_questions
            else:
                print("No valid questions found, using fallback")
                return fallback_quiz
                
        except json.JSONDecodeError as e:
            print(f"JSON decode error in quiz generation: {e}")
            return fallback_quiz
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return fallback_quiz
    
    def _generate_fallback_quiz(self, text: str, num_questions: int = 3) -> List[Dict[str, Any]]:
        """Generate fallback quiz questions for demo purposes"""
        print(f"Using fallback quiz generation for demo purposes")
        
        fallback_questions = [
            {
                "question": "What is the main topic discussed in this content?",
                "options": [
                    "Learning and education",
                    "Technology and computers", 
                    "Sports and recreation",
                    "Food and cooking"
                ],
                "correct_answer": "Learning and education",
                "explanation": "Based on the educational context of this content"
            },
            {
                "question": "Which learning method is most effective for comprehension?",
                "options": [
                    "Passive listening only",
                    "Active engagement with visual aids",
                    "Memorization without understanding",
                    "Speed reading techniques"
                ],
                "correct_answer": "Active engagement with visual aids",
                "explanation": "Active learning with visual elements enhances comprehension, especially for deaf and hard-of-hearing learners"
            },
            {
                "question": "What accessibility feature is most important for deaf students?",
                "options": [
                    "Audio amplification only",
                    "Visual and sign language support",
                    "Faster speaking pace",
                    "Reduced content complexity"
                ],
                "correct_answer": "Visual and sign language support",
                "explanation": "Visual elements and sign language are crucial accessibility features for deaf and hard-of-hearing students"
            }
        ]
        
        # Return the requested number of questions
        return fallback_questions[:num_questions]
    
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