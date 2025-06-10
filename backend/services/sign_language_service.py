import requests
import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class SignLanguageService:
    def __init__(self):
        self.signall_api_key = os.getenv("SIGNALL_API_KEY")
        self.base_url = "https://api.signall.us"
        
        # Fallback ASL dictionary for basic signs when API is not available
        self.basic_signs = {
            "hello": {"gesture": "wave", "description": "Wave hand"},
            "thank you": {"gesture": "flat_hand_to_chin", "description": "Flat hand from chin forward"},
            "yes": {"gesture": "nod", "description": "Nod head up and down"},
            "no": {"gesture": "shake", "description": "Shake head left and right"},
            "please": {"gesture": "circle_chest", "description": "Circle flat hand on chest"},
            "good": {"gesture": "thumbs_up", "description": "Thumbs up gesture"},
            "bad": {"gesture": "thumbs_down", "description": "Thumbs down gesture"},
            "learn": {"gesture": "book_to_head", "description": "Book gesture to forehead"},
            "understand": {"gesture": "lightbulb", "description": "Index finger tap to temple"},
            "question": {"gesture": "index_finger_curve", "description": "Index finger curved like question mark"},
        }
    
    async def translate_to_asl(self, text: str) -> Dict[str, Any]:
        """Translate text to ASL gestures and descriptions"""
        try:
            # If SignAll API is available, use it
            if self.signall_api_key:
                return await self._signall_translate(text)
            else:
                # Use fallback translation
                return await self._fallback_translate(text)
        except Exception as e:
            print(f"Error translating to ASL: {e}")
            return await self._fallback_translate(text)
    
    async def _signall_translate(self, text: str) -> Dict[str, Any]:
        """Use SignAll API for professional ASL translation"""
        headers = {
            "Authorization": f"Bearer {self.signall_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "text": text,
            "output_format": "json",
            "include_timestamps": True
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/translate",
                headers=headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return await self._fallback_translate(text)
        except:
            return await self._fallback_translate(text)
    
    async def _fallback_translate(self, text: str) -> Dict[str, Any]:
        """Fallback ASL translation using basic sign dictionary"""
        words = text.lower().split()
        translations = []
        
        for word in words:
            # Check for exact matches
            if word in self.basic_signs:
                translations.append({
                    "word": word,
                    "gesture": self.basic_signs[word]["gesture"],
                    "description": self.basic_signs[word]["description"],
                    "timing": len(translations) * 1.5  # 1.5 seconds per sign
                })
            else:
                # For unknown words, provide fingerspelling instruction
                translations.append({
                    "word": word,
                    "gesture": "fingerspell",
                    "description": f"Fingerspell '{word.upper()}'",
                    "timing": len(translations) * 1.5
                })
        
        return {
            "original_text": text,
            "total_duration": len(translations) * 1.5,
            "signs": translations,
            "avatar_instructions": self._generate_avatar_instructions(translations)
        }
    
    def _generate_avatar_instructions(self, translations: List[Dict]) -> List[Dict]:
        """Generate instructions for 3D avatar animation"""
        instructions = []
        
        for sign in translations:
            gesture = sign["gesture"]
            
            # Map gestures to avatar animations
            if gesture == "wave":
                instructions.append({
                    "action": "wave_hand",
                    "hand": "right",
                    "duration": 1.0,
                    "timing": sign["timing"]
                })
            elif gesture == "thumbs_up":
                instructions.append({
                    "action": "thumbs_up",
                    "hand": "right",
                    "duration": 1.0,
                    "timing": sign["timing"]
                })
            elif gesture == "nod":
                instructions.append({
                    "action": "nod_head",
                    "direction": "vertical",
                    "duration": 1.0,
                    "timing": sign["timing"]
                })
            elif gesture == "fingerspell":
                instructions.append({
                    "action": "fingerspell_sequence",
                    "letters": sign["word"],
                    "duration": len(sign["word"]) * 0.5,
                    "timing": sign["timing"]
                })
            else:
                # Default gesture
                instructions.append({
                    "action": "point_forward",
                    "hand": "right",
                    "duration": 1.0,
                    "timing": sign["timing"]
                })
        
        return instructions
    
    async def get_sign_video_url(self, gesture: str) -> str:
        """Get URL for sign demonstration video"""
        # In a real implementation, this would return URLs to sign videos
        # For MVP, return placeholder video URLs
        video_mapping = {
            "wave": "/videos/asl/wave.mp4",
            "thumbs_up": "/videos/asl/thumbs_up.mp4",
            "nod": "/videos/asl/nod.mp4",
            "fingerspell": "/videos/asl/fingerspell.mp4"
        }
        
        return video_mapping.get(gesture, "/videos/asl/default.mp4")

sign_language_service = SignLanguageService() 