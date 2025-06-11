import os
import json
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class SignLanguageService:
    def __init__(self):
        # Comprehensive ASL dictionary for educational content
        self.basic_signs = {
            # Greetings and Common Words
            "hello": {"gesture": "wave", "description": "Wave hand with open palm"},
            "goodbye": {"gesture": "wave_farewell", "description": "Wave hand side to side"},
            "thank you": {"gesture": "flat_hand_to_chin", "description": "Flat hand from chin forward"},
            "thanks": {"gesture": "flat_hand_to_chin", "description": "Flat hand from chin forward"},
            "yes": {"gesture": "fist_nod", "description": "Closed fist nod up and down"},
            "no": {"gesture": "two_finger_wave", "description": "Index and middle finger wave side to side"},
            "please": {"gesture": "circle_chest", "description": "Flat hand circle on chest"},
            "sorry": {"gesture": "fist_circle_chest", "description": "Closed fist circle on chest"},
            
            # Emotional States
            "good": {"gesture": "thumbs_up", "description": "Thumbs up gesture"},
            "bad": {"gesture": "thumbs_down", "description": "Thumbs down gesture"},
            "happy": {"gesture": "smile_hands", "description": "Hands move up from smile"},
            "sad": {"gesture": "tear_drop", "description": "Fingers trace tears down face"},
            "excited": {"gesture": "bounce_hands", "description": "Both hands bounce up and down"},
            "confused": {"gesture": "scratch_head", "description": "Index finger scratch temple"},
            
            # Learning and Education
            "learn": {"gesture": "book_to_head", "description": "Open hand from book to forehead"},
            "study": {"gesture": "book_focus", "description": "Point to book then to eyes"},
            "teach": {"gesture": "hands_forward", "description": "Both hands move forward from head"},
            "understand": {"gesture": "lightbulb", "description": "Index finger tap to temple"},
            "know": {"gesture": "tap_temple", "description": "Fingertips tap temple"},
            "think": {"gesture": "finger_temple", "description": "Index finger circle at temple"},
            "remember": {"gesture": "thumb_to_forehead", "description": "Thumb from forehead to chin"},
            "forget": {"gesture": "hand_sweep_forehead", "description": "Hand sweeps across forehead"},
            "question": {"gesture": "index_finger_curve", "description": "Index finger curved like question mark"},
            "answer": {"gesture": "point_forward", "description": "Index finger points forward"},
            "explain": {"gesture": "hands_alternate", "description": "Hands alternate back and forth"},
            "show": {"gesture": "palm_present", "description": "Open palm presents forward"},
            "example": {"gesture": "point_palm", "description": "Point to open palm"},
            
            # Academic Subjects
            "math": {"gesture": "multiply_hands", "description": "Hands cross and uncross"},
            "science": {"gesture": "test_tube", "description": "One hand holds, other pours"},
            "history": {"gesture": "scroll_hands", "description": "Hands mimic unrolling scroll"},
            "english": {"gesture": "book_open", "description": "Hands mimic opening book"},
            "reading": {"gesture": "eyes_to_hand", "description": "Eyes move across open hand"},
            "writing": {"gesture": "pen_motion", "description": "Finger writes on palm"},
            "computer": {"gesture": "type_hands", "description": "Fingers type on invisible keyboard"},
            "technology": {"gesture": "finger_tap_rapid", "description": "Rapid finger tapping motion"},
            
            # Time and Numbers
            "time": {"gesture": "watch_tap", "description": "Tap wrist where watch would be"},
            "today": {"gesture": "hands_down_today", "description": "Both hands move down from chest"},
            "tomorrow": {"gesture": "thumb_forward", "description": "Thumb points forward"},
            "yesterday": {"gesture": "thumb_back", "description": "Thumb points backward"},
            "now": {"gesture": "hands_drop", "description": "Both hands drop down quickly"},
            "later": {"gesture": "l_hand_forward", "description": "L-shaped hand moves forward"},
            "first": {"gesture": "thumb_up_tap", "description": "Thumb up, tap with index finger"},
            "second": {"gesture": "peace_sign_tap", "description": "Peace sign, tap with thumb"},
            "last": {"gesture": "pinky_up_tap", "description": "Pinky up, tap with index finger"},
            
            # Actions
            "go": {"gesture": "point_direction", "description": "Index fingers point in direction"},
            "come": {"gesture": "beckon_hands", "description": "Hands beckon toward body"},
            "stop": {"gesture": "flat_hand_out", "description": "Flat hand extended forward"},
            "start": {"gesture": "finger_twist", "description": "Index finger twists"},
            "finish": {"gesture": "hands_flip_down", "description": "Both hands flip down"},
            "help": {"gesture": "fist_on_palm", "description": "Closed fist on open palm, lift up"},
            "work": {"gesture": "fist_tap_fist", "description": "One fist taps other fist"},
            "play": {"gesture": "y_hands_shake", "description": "Y-shaped hands shake"},
            
            # Common Academic Words
            "book": {"gesture": "hands_open_close", "description": "Hands mimic opening and closing book"},
            "page": {"gesture": "flip_motion", "description": "Thumb and finger flip pages"},
            "word": {"gesture": "g_hand_tap", "description": "G-shaped hand taps index finger"},
            "sentence": {"gesture": "finger_line", "description": "Index fingers draw line"},
            "paragraph": {"gesture": "p_hand_down", "description": "P-shaped hand moves down"},
            "chapter": {"gesture": "c_hand_slide", "description": "C-shaped hand slides across"},
            "test": {"gesture": "x_hands_down", "description": "X-shaped hands move down"},
            "quiz": {"gesture": "q_hand_shake", "description": "Q-shaped hand shakes"},
            "homework": {"gesture": "h_hands_alternate", "description": "H-shaped hands alternate"},
            "class": {"gesture": "c_hands_circle", "description": "C-shaped hands form circle"},
            "school": {"gesture": "clap_hands", "description": "Hands clap together twice"},
            "teacher": {"gesture": "teach_person", "description": "Teach gesture plus person sign"},
            "student": {"gesture": "learn_person", "description": "Learn gesture plus person sign"},
            
            # Technology Terms
            "internet": {"gesture": "web_hands", "description": "Fingers weave back and forth"},
            "website": {"gesture": "w_web_motion", "description": "W-hand with web motion"},
            "email": {"gesture": "e_mail_motion", "description": "E-hand with mailing motion"},
            "download": {"gesture": "d_hand_down", "description": "D-shaped hand moves down"},
            "upload": {"gesture": "u_hand_up", "description": "U-shaped hand moves up"},
            "click": {"gesture": "finger_tap", "description": "Index finger taps down"},
            "type": {"gesture": "fingers_type", "description": "All fingers type motion"},
            "search": {"gesture": "s_hand_circle", "description": "S-shaped hand circles"},
            
            # Science Terms
            "experiment": {"gesture": "test_tube_mix", "description": "Hands mimic mixing in test tube"},
            "formula": {"gesture": "f_hand_write", "description": "F-hand writes in air"},
            "equation": {"gesture": "equal_hands", "description": "Hands show equal sign"},
            "theory": {"gesture": "t_hand_think", "description": "T-hand at thinking position"},
            "hypothesis": {"gesture": "h_hand_question", "description": "H-hand with questioning motion"},
            "data": {"gesture": "d_hands_collect", "description": "D-hands gather information"},
            "result": {"gesture": "r_hands_present", "description": "R-hands present findings"},
            "conclusion": {"gesture": "c_hands_close", "description": "C-hands come together"},
            
            # Common Adjectives
            "big": {"gesture": "hands_spread_wide", "description": "Hands spread wide apart"},
            "small": {"gesture": "pinch_fingers", "description": "Thumb and finger pinch"},
            "fast": {"gesture": "quick_motion", "description": "Index fingers flick quickly"},
            "slow": {"gesture": "slow_hand_drag", "description": "Hand drags slowly across palm"},
            "easy": {"gesture": "brush_fingers", "description": "Fingers brush upward"},
            "hard": {"gesture": "knuckles_knock", "description": "Knuckles knock together"},
            "new": {"gesture": "scoop_palm", "description": "Hand scoops across palm"},
            "old": {"gesture": "beard_stroke", "description": "Hand strokes imaginary beard"},
            "important": {"gesture": "f_hands_emphatic", "description": "F-hands move emphatically"},
            "different": {"gesture": "index_cross", "description": "Index fingers cross and separate"},
            "same": {"gesture": "y_hands_together", "description": "Y-hands come together"},
            
            # Additional Common Words for Better Coverage
            "i": {"gesture": "point_self", "description": "Point to self with index finger"},
            "you": {"gesture": "point_forward", "description": "Point forward with index finger"},
            "we": {"gesture": "point_self_sweep", "description": "Point to self then sweep to include others"},
            "they": {"gesture": "point_multiple", "description": "Point to multiple people"},
            "he": {"gesture": "point_side", "description": "Point to the side"},
            "she": {"gesture": "point_side_fem", "description": "Point to the side (feminine)"},
            "it": {"gesture": "point_object", "description": "Point to object or area"},
            "this": {"gesture": "point_down", "description": "Point downward to indicate 'this'"},
            "that": {"gesture": "point_away", "description": "Point away to indicate 'that'"},
            
            # Common Verbs
            "want": {"gesture": "claw_hands_pull", "description": "Claw hands pull toward body"},
            "need": {"gesture": "finger_hook_down", "description": "Index finger hooks down"},
            "like": {"gesture": "thumb_middle_chest", "description": "Thumb and middle finger on chest"},
            "love": {"gesture": "crossed_arms_chest", "description": "Arms crossed over chest"},
            "have": {"gesture": "fingertips_to_chest", "description": "Fingertips touch chest"},
            "get": {"gesture": "hands_come_together", "description": "Hands come together"},
            "give": {"gesture": "flat_hand_forward", "description": "Flat hand moves forward"},
            "take": {"gesture": "hand_grab_pull", "description": "Hand grabs and pulls toward body"},
            "make": {"gesture": "fist_twist_stack", "description": "Fists twist and stack"},
            "see": {"gesture": "v_eyes_forward", "description": "V-shape from eyes forward"},
            "look": {"gesture": "v_hand_point", "description": "V-hand points in direction"},
            "hear": {"gesture": "point_ear", "description": "Point to ear"},
            "listen": {"gesture": "cup_ear", "description": "Cup hand behind ear"},
            "say": {"gesture": "finger_from_mouth", "description": "Index finger moves from mouth forward"},
            "tell": {"gesture": "finger_mouth_forward", "description": "Finger from mouth toward person"},
            "ask": {"gesture": "hands_prayer_forward", "description": "Prayer hands move forward"},
            "call": {"gesture": "y_hand_to_ear", "description": "Y-hand to ear like phone"},
            "try": {"gesture": "t_hands_effort", "description": "T-hands show effort"},
            "use": {"gesture": "u_hand_circle", "description": "U-hand makes circle motion"},
            "find": {"gesture": "pinch_pickup", "description": "Pinch fingers pick up object"},
            "keep": {"gesture": "k_hands_stack", "description": "K-hands stack on top"},
            "put": {"gesture": "flat_hand_place", "description": "Flat hand places object"},
            "turn": {"gesture": "index_finger_rotate", "description": "Index finger rotates"},
            "move": {"gesture": "flat_hands_slide", "description": "Flat hands slide together"},
            "run": {"gesture": "l_hands_alternate", "description": "L-hands alternate quickly"},
            "walk": {"gesture": "flat_hands_alternate", "description": "Flat hands alternate walking"},
            "sit": {"gesture": "h_hands_sit", "description": "H-hands sit down motion"},
            "stand": {"gesture": "v_hand_stand_up", "description": "V-hand stands up"},
            "open": {"gesture": "b_hands_open", "description": "B-hands open outward"},
            "close": {"gesture": "b_hands_close", "description": "B-hands close together"},
            "cut": {"gesture": "v_hand_scissor", "description": "V-hand makes cutting motion"},
            "break": {"gesture": "hands_snap_apart", "description": "Hands snap apart"},
            
            # Articles and Prepositions  
            "the": {"gesture": "t_hand_slide", "description": "T-hand slides to the side"},
            "a": {"gesture": "a_hand_twist", "description": "A-hand with slight twist"},
            "an": {"gesture": "a_hand_twist", "description": "A-hand with slight twist"},
            "and": {"gesture": "five_hand_close", "description": "Open hand closes to fist"},
            "or": {"gesture": "o_r_hands", "description": "O-hand then R-hand"},
            "but": {"gesture": "index_fingers_cross", "description": "Index fingers cross"},
            "in": {"gesture": "flat_hand_into", "description": "Flat hand moves into other hand"},
            "on": {"gesture": "flat_hand_on_top", "description": "Flat hand places on top"},
            "at": {"gesture": "fingertip_touch", "description": "Fingertip touches target"},
            "to": {"gesture": "index_finger_point", "description": "Index finger points forward"},
            "for": {"gesture": "f_hand_forward", "description": "F-hand moves forward"},
            "with": {"gesture": "a_hands_together", "description": "A-hands come together"},
            "by": {"gesture": "b_hand_slide", "description": "B-hand slides past"},
            "from": {"gesture": "x_finger_pull", "description": "X-finger pulls away from"},
            "up": {"gesture": "index_finger_up", "description": "Index finger points up"},
            "down": {"gesture": "index_finger_down", "description": "Index finger points down"},
            "out": {"gesture": "hand_pull_out", "description": "Hand pulls out from container"},
            "off": {"gesture": "hand_lift_off", "description": "Hand lifts off surface"},
            "over": {"gesture": "hand_arc_over", "description": "Hand arcs over other hand"},
            "under": {"gesture": "hand_slide_under", "description": "Hand slides under other hand"},
            
            # Modal Verbs and Common Auxiliaries
            "will": {"gesture": "flat_hand_future", "description": "Flat hand moves forward (future)"},
            "would": {"gesture": "w_hand_conditional", "description": "W-hand with conditional movement"},
            "can": {"gesture": "s_hands_down", "description": "S-hands move down (ability)"},
            "could": {"gesture": "c_hands_down", "description": "C-hands move down (past ability)"},
            "should": {"gesture": "index_finger_shake", "description": "Index finger shakes (obligation)"},
            "must": {"gesture": "m_hand_emphatic", "description": "M-hand with emphatic motion"},
            "may": {"gesture": "m_hands_maybe", "description": "M-hands show possibility"},
            "might": {"gesture": "m_hands_uncertain", "description": "M-hands show uncertainty"},
            "be": {"gesture": "b_hand_exist", "description": "B-hand shows existence"},
            "is": {"gesture": "i_hand_be", "description": "I-hand in 'be' position"},
            "are": {"gesture": "r_hand_be", "description": "R-hand in 'be' position"},
            "was": {"gesture": "w_hand_past", "description": "W-hand moves to past"},
            "were": {"gesture": "w_hand_plural_past", "description": "W-hand for plural past"},
            "do": {"gesture": "d_hands_action", "description": "D-hands show action"},
            "does": {"gesture": "d_hand_singular", "description": "D-hand singular action"},
            "did": {"gesture": "d_hand_past", "description": "D-hand past action"},
            "done": {"gesture": "d_hands_finished", "description": "D-hands show completion"}
        }
        
        # Common word patterns and their ASL equivalents
        self.pattern_mappings = {
            # Past tense - many verbs in ASL don't change for tense
            "ed$": "past_tense_context",
            # Plural - many nouns in ASL use repetition or number signs
            "s$": "plural_context",
            # -ing words
            "ing$": "continuous_action",
            # -ly adverbs
            "ly$": "manner_modifier"
        }
    
    async def translate_to_asl(self, text: str) -> Dict[str, Any]:
        """Translate text to ASL gestures and descriptions using comprehensive dictionary"""
        try:
            return await self._enhanced_translate(text)
        except Exception as e:
            print(f"Error translating to ASL: {e}")
            # Return basic error response
            return {
                "original_text": text,
                "total_duration": 1.5,
                "signs": [{
                    "word": "error",
                    "gesture": "point_forward",
                    "description": "Unable to translate",
                    "timing": 0
                }],
                "avatar_instructions": []
            }
    
    async def _enhanced_translate(self, text: str) -> Dict[str, Any]:
        """Enhanced ASL translation with comprehensive sign recognition"""
        # Clean and prepare text
        words = text.lower().replace(',', '').replace('.', '').replace('?', '').replace('!', '').split()
        translations = []
        current_time = 0
        
        for word in words:
            sign_data = self._get_sign_for_word(word)
            sign_data["timing"] = current_time
            translations.append(sign_data)
            current_time += sign_data.get("duration", 1.5)
        
        return {
            "original_text": text,
            "total_duration": current_time,
            "signs": translations,
            "avatar_instructions": self._generate_avatar_instructions(translations)
        }
    
    def _get_sign_for_word(self, word: str) -> Dict[str, Any]:
        """Get the appropriate sign for a word with enhanced matching"""
        # Check exact match first
        if word in self.basic_signs:
            return {
                "word": word,
                "gesture": self.basic_signs[word]["gesture"],
                "description": self.basic_signs[word]["description"],
                "duration": 1.5,
                "confidence": "high"
            }
        
        # Check for root words (remove common endings)
        root_word = self._get_root_word(word)
        if root_word != word and root_word in self.basic_signs:
            return {
                "word": word,
                "gesture": self.basic_signs[root_word]["gesture"],
                "description": f"{self.basic_signs[root_word]['description']} (for '{word}')",
                "duration": 1.5,
                "confidence": "medium"
            }
        
        # Check for compound words
        compound_signs = self._check_compound_word(word)
        if compound_signs:
            return compound_signs
        
        # For unknown words, provide intelligent fingerspelling
        if len(word) <= 3:
            return {
                "word": word,
                "gesture": "fingerspell_short",
                "description": f"Fingerspell '{word.upper()}' (short word)",
                "duration": len(word) * 0.5,
                "confidence": "low"
            }
        else:
            # For longer words, suggest abbreviation or fingerspelling
            return {
                "word": word,
                "gesture": "fingerspell_or_abbreviate",
                "description": f"Fingerspell '{word.upper()}' or use abbreviation",
                "duration": len(word) * 0.4,
                "confidence": "low"
            }
    
    def _get_root_word(self, word: str) -> str:
        """Extract root word by removing common endings"""
        if word.endswith('ing'):
            return word[:-3]
        elif word.endswith('ed'):
            return word[:-2]
        elif word.endswith('er'):
            return word[:-2]
        elif word.endswith('est'):
            return word[:-3]
        elif word.endswith('s') and len(word) > 3:
            return word[:-1]
        elif word.endswith('ly'):
            return word[:-2]
        return word
    
    def _check_compound_word(self, word: str) -> Dict[str, Any]:
        """Check if word can be broken into known signs"""
        # Simple compound word detection
        compound_words = {
            "classroom": ["class", "room"],
            "homework": ["home", "work"],
            "textbook": ["text", "book"],
            "notebook": ["note", "book"],
            "website": ["web", "site"],
            "keyboard": ["key", "board"],
            "smartphone": ["smart", "phone"],
            "blackboard": ["black", "board"],
            "whiteboard": ["white", "board"],
        }
        
        if word in compound_words:
            parts = compound_words[word]
            if all(part in self.basic_signs for part in parts):
                return {
                    "word": word,
                    "gesture": "compound_sign",
                    "description": f"Sign {' + '.join(parts)}",
                    "duration": len(parts) * 1.5,
                    "confidence": "medium",
                    "compound_parts": parts
                }
        
        return None
    
    def _generate_avatar_instructions(self, translations: List[Dict]) -> List[Dict]:
        """Generate instructions for 3D avatar animation with enhanced gestures"""
        instructions = []
        
        for sign in translations:
            gesture = sign["gesture"]
            timing = sign["timing"]
            duration = sign.get("duration", 1.5)
            
            # Map enhanced gestures to avatar animations
            if gesture == "wave":
                instructions.append({
                    "action": "wave_hand",
                    "hand": "right",
                    "style": "open_palm",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "thumbs_up":
                instructions.append({
                    "action": "thumbs_up",
                    "hand": "right",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "fist_nod":
                instructions.append({
                    "action": "fist_nod",
                    "hand": "right", 
                    "head_movement": "nod",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "book_to_head":
                instructions.append({
                    "action": "learn_sign",
                    "movement": "book_to_forehead",
                    "hands": "both",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "lightbulb":
                instructions.append({
                    "action": "understand_sign",
                    "hand": "right",
                    "target": "temple",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "multiply_hands":
                instructions.append({
                    "action": "math_sign",
                    "hands": "both",
                    "movement": "cross_uncross",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "test_tube":
                instructions.append({
                    "action": "science_sign",
                    "hands": "both",
                    "movement": "pour_motion",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "hands_open_close":
                instructions.append({
                    "action": "book_sign",
                    "hands": "both",
                    "movement": "open_close",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "type_hands":
                instructions.append({
                    "action": "computer_sign",
                    "hands": "both",
                    "movement": "typing_motion",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "watch_tap":
                instructions.append({
                    "action": "time_sign",
                    "hand": "right",
                    "target": "wrist",
                    "movement": "tap",
                    "duration": duration,
                    "timing": timing
                })
            elif gesture == "compound_sign":
                # Handle compound words by breaking them down
                if "compound_parts" in sign:
                    for i, part in enumerate(sign["compound_parts"]):
                        part_timing = timing + (i * duration / len(sign["compound_parts"]))
                        part_duration = duration / len(sign["compound_parts"])
                        if part in self.basic_signs:
                            part_gesture = self.basic_signs[part]["gesture"]
                            instructions.append({
                                "action": f"{part_gesture}_compound",
                                "word": part,
                                "duration": part_duration,
                                "timing": part_timing
                            })
            elif gesture.startswith("fingerspell"):
                if "short" in gesture:
                    instructions.append({
                        "action": "fingerspell_short",
                        "letters": sign["word"].upper(),
                        "speed": "normal",
                        "duration": duration,
                        "timing": timing
                    })
                else:
                    instructions.append({
                        "action": "fingerspell_or_abbreviate",
                        "word": sign["word"],
                        "letters": sign["word"].upper(),
                        "speed": "moderate",
                        "suggestion": "Consider abbreviation for demo",
                        "duration": duration,
                        "timing": timing
                    })
            else:
                # Enhanced default gestures for specific categories
                if any(category in gesture for category in ["hands", "finger", "palm"]):
                    instructions.append({
                        "action": "specific_gesture",
                        "gesture_type": gesture,
                        "description": sign["description"],
                        "duration": duration,
                        "timing": timing
                    })
                else:
                    # Fallback to pointing for truly unknown gestures
                    instructions.append({
                        "action": "point_forward",
                        "hand": "right",
                        "word": sign["word"],
                        "duration": duration,
                        "timing": timing
                    })
        
        return instructions
    
    async def get_sign_video_url(self, gesture: str) -> str:
        """Get URL for sign demonstration video with enhanced mapping"""
        # Enhanced video mapping for comprehensive gesture library
        video_mapping = {
            # Basic gestures
            "wave": "/videos/asl/greetings/wave.mp4",
            "thumbs_up": "/videos/asl/emotions/thumbs_up.mp4",
            "fist_nod": "/videos/asl/responses/yes.mp4",
            "two_finger_wave": "/videos/asl/responses/no.mp4",
            
            # Educational signs
            "book_to_head": "/videos/asl/education/learn.mp4",
            "lightbulb": "/videos/asl/education/understand.mp4",
            "multiply_hands": "/videos/asl/subjects/math.mp4",
            "test_tube": "/videos/asl/subjects/science.mp4",
            
            # Technology signs
            "type_hands": "/videos/asl/technology/computer.mp4",
            "web_hands": "/videos/asl/technology/internet.mp4",
            
            # Time and actions
            "watch_tap": "/videos/asl/time/time.mp4",
            "point_direction": "/videos/asl/actions/go.mp4",
            
            # Books and reading
            "hands_open_close": "/videos/asl/education/book.mp4",
            "eyes_to_hand": "/videos/asl/education/reading.mp4",
            
            # Fingerspelling
            "fingerspell_short": "/videos/asl/fingerspelling/short_words.mp4",
            "fingerspell_or_abbreviate": "/videos/asl/fingerspelling/long_words.mp4"
        }
        
        return video_mapping.get(gesture, "/videos/asl/general/default_gesture.mp4")
    
    def get_gesture_confidence_info(self, translations: List[Dict]) -> Dict[str, Any]:
        """Provide information about gesture confidence for demo purposes"""
        high_confidence = sum(1 for t in translations if t.get("confidence") == "high")
        medium_confidence = sum(1 for t in translations if t.get("confidence") == "medium")
        low_confidence = sum(1 for t in translations if t.get("confidence") == "low")
        
        total = len(translations)
        coverage_percentage = ((high_confidence + medium_confidence) / total * 100) if total > 0 else 0
        
        return {
            "total_words": total,
            "high_confidence_signs": high_confidence,
            "medium_confidence_signs": medium_confidence, 
            "fingerspelling_needed": low_confidence,
            "asl_coverage_percentage": round(coverage_percentage, 1),
            "demo_ready": coverage_percentage >= 60  # Good for demo if 60%+ are actual signs
        }

sign_language_service = SignLanguageService() 