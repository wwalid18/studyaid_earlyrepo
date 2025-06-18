import json
import logging
from flask import current_app

logger = logging.getLogger(__name__)

# Try to import Google Generative AI, but make it optional
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Google Generative AI not available: {e}")
    GEMINI_AVAILABLE = False
    genai = None

class AIService:
    def __init__(self):
        self.api_key = current_app.config.get('GEMINI_API_KEY')
        self.model_name = current_app.config.get('GEMINI_MODEL', 'gemini-1.5-flash')
        self.max_tokens = current_app.config.get('MAX_TOKENS', 2048)
        self.temperature = current_app.config.get('TEMPERATURE', 0.7)
        
        # Check if Gemini is available and configured
        if not GEMINI_AVAILABLE:
            logger.warning("Google Generative AI library not available. AI features will use fallback content.")
            self.ai_available = False
        elif not self.api_key:
            logger.warning("GEMINI_API_KEY not found. AI features will use fallback content.")
            self.ai_available = False
        else:
            self.ai_available = True
            try:
                # Configure Gemini
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.ai_available = False
    
    def generate_summary_from_highlights(self, highlights, collection_title=None):
        """
        Generate a comprehensive summary from a list of highlights
        
        Args:
            highlights: List of Highlight objects
            collection_title: Optional title of the collection
            
        Returns:
            str: Generated summary
        """
        if not self.ai_available:
            return self._generate_fallback_summary(highlights, collection_title)
        
        try:
            # Prepare highlights text
            highlights_text = self._prepare_highlights_text(highlights)
            
            # Create prompt for summary generation
            prompt = f"""
            You are an expert educational content summarizer. Please create a comprehensive, well-structured summary based on the following highlights from a study collection.
            
            Collection Title: {collection_title or 'Study Collection'}
            
            Highlights:
            {highlights_text}
            
            Please create a summary that:
            1. Synthesizes the key concepts and main ideas
            2. Maintains logical flow and coherence
            3. Uses clear, academic language
            4. Is comprehensive but concise (aim for 300-500 words)
            5. Organizes information in a logical structure
            6. Highlights the most important points from the source material
            
            Summary:
            """
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            if response.text:
                return response.text.strip()
            else:
                raise Exception("No response generated from AI model")
                
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return self._generate_fallback_summary(highlights, collection_title)
    
    def generate_quiz_from_summary(self, summary, num_questions=4):
        """
        Generate quiz questions from a summary
        
        Args:
            summary: The summary text
            num_questions: Number of questions to generate (default: 4)
            
        Returns:
            dict: Quiz data with questions and answers
        """
        if not self.ai_available:
            return self._generate_fallback_quiz(summary, num_questions)
        
        try:
            prompt = f"""
            You are an expert educational quiz creator. Please create {num_questions} multiple-choice questions based on the following summary.
            
            Summary:
            {summary}
            
            Please create a quiz that:
            1. Tests understanding of key concepts from the summary
            2. Has 4 options (A, B, C, D) for each question
            3. Has only one correct answer per question
            4. Covers different aspects of the content
            5. Uses clear, unambiguous language
            6. Is appropriate for educational assessment
            
            Return the response as a JSON object with this exact structure:
            {{
                "title": "Quiz based on the summary",
                "questions": [
                    {{
                        "question": "Question text here?",
                        "options": {{
                            "A": "Option A text",
                            "B": "Option B text", 
                            "C": "Option C text",
                            "D": "Option D text"
                        }},
                        "correct_answer": "A"
                    }}
                ]
            }}
            
            Make sure the JSON is valid and properly formatted.
            """
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            if response.text:
                # Try to parse JSON response
                try:
                    quiz_data = json.loads(response.text.strip())
                    
                    # Validate quiz structure
                    if not self._validate_quiz_structure(quiz_data):
                        raise Exception("Invalid quiz structure generated")
                    
                    return quiz_data
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON response: {str(e)}")
                    # Fallback: try to extract JSON from response
                    quiz_data = self._extract_json_from_response(response.text)
                    if quiz_data:
                        return quiz_data
                    else:
                        raise Exception("Could not parse quiz data from AI response")
            else:
                raise Exception("No response generated from AI model")
                
        except Exception as e:
            logger.error(f"Error generating quiz: {str(e)}")
            return self._generate_fallback_quiz(summary, num_questions)
    
    def _generate_fallback_summary(self, highlights, collection_title=None):
        """Generate a fallback summary when AI is not available"""
        highlights_text = self._prepare_highlights_text(highlights)
        
        summary = f"""
        Summary of {collection_title or 'Study Collection'}
        
        This is a comprehensive summary of the selected highlights from your study collection. 
        The content covers important information that has been highlighted for your reference.
        
        Key Points:
        {highlights_text}
        
        This summary provides an overview of the main concepts and ideas from your selected highlights. 
        For more detailed analysis, consider reviewing the original source materials.
        """
        
        return summary.strip()
    
    def _generate_fallback_quiz(self, summary, num_questions=4):
        """Generate a fallback quiz when AI is not available"""
        questions = []
        
        # Create simple questions based on the summary
        question_templates = [
            {
                "question": "What is the main topic of this summary?",
                "options": {
                    "A": "Study materials and learning",
                    "B": "Technology and innovation", 
                    "C": "Science and research",
                    "D": "Education and development"
                },
                "correct_answer": "A"
            },
            {
                "question": "How many key points are typically covered in a good summary?",
                "options": {
                    "A": "1-2 points",
                    "B": "3-5 points",
                    "C": "6-8 points", 
                    "D": "9-10 points"
                },
                "correct_answer": "B"
            },
            {
                "question": "What is the purpose of creating summaries?",
                "options": {
                    "A": "To make content longer",
                    "B": "To simplify and organize information",
                    "C": "To change the original meaning",
                    "D": "To remove important details"
                },
                "correct_answer": "B"
            },
            {
                "question": "Which of the following is NOT a characteristic of a good summary?",
                "options": {
                    "A": "Clear and concise",
                    "B": "Accurate to the source",
                    "C": "Includes all details",
                    "D": "Well-organized"
                },
                "correct_answer": "C"
            }
        ]
        
        # Use available questions up to the requested number
        for i in range(min(num_questions, len(question_templates))):
            questions.append(question_templates[i])
        
        return {
            "title": "Quiz based on the summary",
            "questions": questions
        }
    
    def _prepare_highlights_text(self, highlights):
        """Prepare highlights text for AI processing"""
        if not highlights:
            return "No highlights provided."
        
        highlights_text = ""
        for i, highlight in enumerate(highlights, 1):
            highlights_text += f"{i}. {highlight.text}\n"
            if highlight.url:
                highlights_text += f"   Source: {highlight.url}\n"
            highlights_text += "\n"
        
        return highlights_text
    
    def _validate_quiz_structure(self, quiz_data):
        """Validate the structure of generated quiz data"""
        try:
            if not isinstance(quiz_data, dict):
                return False
            
            if 'title' not in quiz_data or 'questions' not in quiz_data:
                return False
            
            if not isinstance(quiz_data['questions'], list):
                return False
            
            for question in quiz_data['questions']:
                if not isinstance(question, dict):
                    return False
                
                required_fields = ['question', 'options', 'correct_answer']
                if not all(field in question for field in required_fields):
                    return False
                
                if not isinstance(question['options'], dict):
                    return False
                
                if 'A' not in question['options'] or 'B' not in question['options'] or \
                   'C' not in question['options'] or 'D' not in question['options']:
                    return False
                
                if question['correct_answer'] not in ['A', 'B', 'C', 'D']:
                    return False
            
            return True
            
        except Exception:
            return False
    
    def _extract_json_from_response(self, response_text):
        """Extract JSON from AI response if it's embedded in other text"""
        try:
            # Look for JSON-like content between curly braces
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            
            if start != -1 and end != 0:
                json_str = response_text[start:end]
                return json.loads(json_str)
            
            return None
        except Exception:
            return None
    
    def test_connection(self):
        """Test the AI service connection"""
        if not self.ai_available:
            return False
            
        try:
            prompt = "Hello, please respond with 'AI service is working' if you can read this."
            response = self.model.generate_content(prompt)
            return response.text is not None
        except Exception as e:
            logger.error(f"AI service connection test failed: {str(e)}")
            return False
    
    def get_status(self):
        """Get the current status of the AI service"""
        return {
            "ai_available": self.ai_available,
            "gemini_available": GEMINI_AVAILABLE,
            "api_key_configured": bool(self.api_key),
            "model": self.model_name if self.ai_available else None
        } 