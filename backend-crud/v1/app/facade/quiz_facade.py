from app.models.quiz import Quiz
from app.models.summary import Summary
from app.utils.db import db
from datetime import datetime
from app.utils.constants import STATIC_QUIZ_TEXT

class QuizFacade:
    @staticmethod
    def save_quiz(summary_id, quiz_text=None):
        # Check if a quiz already exists for this summary
        existing_quiz = Quiz.query.filter_by(summary_id=summary_id).first()
        if existing_quiz:
            return existing_quiz

        # Use provided quiz_text or fall back to static quiz
        quiz_text = quiz_text or STATIC_QUIZ_TEXT

        # Verify summary exists
        Summary.query.get_or_404(summary_id)
        timestamp = datetime.utcnow()
        quiz = Quiz(
            summary_id=summary_id,
            quiz_text=quiz_text,
            timestamp=timestamp
        )
        db.session.add(quiz)
        db.session.commit()
        return quiz

    @staticmethod
    def update_quiz(quiz_id, data):
        quiz = Quiz.query.get_or_404(quiz_id)
        quiz.quiz_text = data.get('quiz_text', quiz.quiz_text)
        quiz.updated_at = datetime.utcnow()
        db.session.commit()
        return quiz

    @staticmethod
    def delete_quiz(quiz_id):
        quiz = Quiz.query.get_or_404(quiz_id)
        db.session.delete(quiz)
        db.session.commit()
        return True

    @staticmethod
    def get_quiz_by_summary(summary_id):
        return Quiz.query.filter_by(summary_id=summary_id).first()

    @staticmethod
    def get_all_quizzes():
        return Quiz.query.all()

    @staticmethod
    def get_quiz_by_id(quiz_id):
        return Quiz.query.get_or_404(quiz_id)