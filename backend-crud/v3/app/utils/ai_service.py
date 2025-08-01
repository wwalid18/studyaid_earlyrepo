import os
import requests
import logging
from flask import current_app
import json

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
MODEL_NAME = "llama3-70b-8192"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class AIService:
    def __init__(self):
        self.ai_available = bool(GROQ_API_KEY)
    def build_quiz_prompt(self, summary):
        return f"""
You are a professional quiz generator.

Your task is to create a multiple-choice quiz based on the provided summary.

Follow these strict rules:
1. Generate exactly 4 unique and non-redundant questions strictly related to the summary.
2. Each question must have only one correct answer.
3. Each question must contain 4 distinct answer options labeled "A", "B", "C", and "D".
4. The correct answer label ("A", "B", "C", or "D") must be randomly assigned for each question.
5. Avoid repeating or rephrasing the same question in any way.
6. Return only a valid JSON array in the following format — no explanations, no extra text:

[
    {{
        "question": "First unique question?",
        "options": {{
            "A": "Option text",
            "B": "Option text",
            "C": "Option text",
            "D": "Option text"
        }},
        "correct_answer": "A"
    }},
    {{
        "question": "Second unique question?",
        "options": {{
            "A": "Option text",
            "B": "Option text",
            "C": "Option text",
            "D": "Option text"
        }},
        "correct_answer": "C"
    }},
    {{
        "question": "Third unique question?",
        "options": {{
            "A": "Option text",
            "B": "Option text",
            "C": "Option text",
            "D": "Option text"
        }},
        "correct_answer": "D"
    }},
    {{
        "question": "Fourth unique question?",
        "options": {{
            "A": "Option text",
            "B": "Option text",
            "C": "Option text",
            "D": "Option text"
        }},
        "correct_answer": "B"
    }}
]

==== Summary ====

{summary}
"""
    def build_prompt(self, highlights, collection_title=None):
        highlights_text = "\n- ".join([h.text if hasattr(h, 'text') else str(h) for h in highlights])
        return f'''
You are an expert content summarizer.

Given a list of key highlights selected by a user from various texts or articles, generate a **clear, concise, and informative summary**. The summary should capture the main ideas, insights, and any essential details presented in the highlights.

**Instructions:**
- Summarize only the information provided in the highlights.
- Do not add external knowledge.
- Use clear and professional language.
- Focus on conveying the main points without redundancy.

**Highlights:**
- {highlights_text}

**Output:**
A well-structured summary based on the above highlights:
'''

    def generate_summary_from_highlights(self, highlights, collection_title=None):
        if not self.ai_available:
            return self._generate_fallback_summary(highlights, collection_title)
        prompt = self.build_prompt(highlights, collection_title)
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        try:
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"Groq API error: {response.status_code} {response.text}")
                return self._generate_fallback_summary(highlights, collection_title)
        except Exception as e:
            logger.error(f"Groq API exception: {e}")
            return self._generate_fallback_summary(highlights, collection_title)

    def generate_quiz_from_summary(self, summary, num_questions=4):
        """
        Generate a quiz from a summary using AI if available, otherwise fallback.
        Returns a dict: { 'title': str, 'questions': list of dicts }
        """
        if not self.ai_available:
            return self._generate_fallback_quiz(summary, num_questions)
        prompt = self.build_quiz_prompt(summary)
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        try:
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                ai_content = response.json()["choices"][0]["message"]["content"].strip()
                # Try to parse the JSON array from the AI response
                try:
                    questions = json.loads(ai_content)
                    if isinstance(questions, list):
                        return {
                            "title": "Quiz based on the summary",
                            "questions": questions
                        }
                    else:
                        logger.error("AI quiz response is not a list")
                        return self._generate_fallback_quiz(summary, num_questions)
                except Exception as e:
                    logger.error(f"Failed to parse AI quiz JSON: {e}\nAI content: {ai_content}")
                    return self._generate_fallback_quiz(summary, num_questions)
            else:
                logger.error(f"Groq API error: {response.status_code} {response.text}")
                return self._generate_fallback_quiz(summary, num_questions)
        except Exception as e:
            logger.error(f"Groq API exception: {e}")
            return self._generate_fallback_quiz(summary, num_questions)

    def _generate_fallback_summary(self, highlights, collection_title=None):
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
        questions = []
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
        for i in range(min(num_questions, len(question_templates))):
            questions.append(question_templates[i])
        return {
            "title": "Quiz based on the summary",
            "questions": questions
        }

    def _prepare_highlights_text(self, highlights):
        if not highlights:
            return "No highlights provided."
        highlights_text = ""
        for i, highlight in enumerate(highlights, 1):
            highlights_text += f"{i}. {getattr(highlight, 'text', str(highlight))}\n"
            if hasattr(highlight, 'url') and highlight.url:
                highlights_text += f"   Source: {highlight.url}\n"
            highlights_text += "\n"
        return highlights_text

    def test_connection(self):
        return self.ai_available

    def get_status(self):
        return {
            "ai_available": self.ai_available,
            "model": MODEL_NAME if self.ai_available else None
        } 
    def generate_quiz(self, summary):
        if not self.ai_available:
            return self._generate_fallback_summary(highlights, collection_title)
        prompt = self.build_quiz_prompt(summary)
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }
        try:
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"Groq API error: {response.status_code} {response.text}")
                return self._generate_fallback_quiz(summary)
        except Exception as e:
            logger.error(f"Groq API exception: {e}")
            return self._generate_fallback_quiz(summary)