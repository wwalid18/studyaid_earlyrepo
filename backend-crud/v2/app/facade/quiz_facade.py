from app.models.quiz import Quiz
from app.models.summary import Summary
from app.utils.db import db
from datetime import datetime
from app.utils.constants import STATIC_QUIZ_QUESTIONS

class QuizFacade:
    @staticmethod
    def save_quiz(data):
        summary_id = data['summary_id']
        title = data.get('title', 'Quiz')
        questions = data.get('questions', STATIC_QUIZ_QUESTIONS)
        timestamp = data.get('timestamp', datetime.utcnow())

        # Check if a quiz already exists for this summary
        existing_quiz = Quiz.query.filter_by(summary_id=summary_id).first()
        if existing_quiz:
            raise ValueError("A quiz already exists for this summary")

        # Create the quiz
        quiz = Quiz(
            summary_id=summary_id,
            title=title,
            questions=questions,
            timestamp=timestamp
        )
        db.session.add(quiz)
        db.session.commit()
        return quiz

    @staticmethod
    def update_quiz(quiz_id, data):
        quiz = Quiz.query.get_or_404(quiz_id)
        
        if 'title' in data:
            quiz.title = data['title']
        if 'questions' in data:
            quiz.questions = data['questions']
        if 'timestamp' in data:
            quiz.timestamp = data['timestamp']
        if 'summary_id' in data:
            quiz.summary_id = data['summary_id']

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
    def get_user_quizzes(user_id):
        return Quiz.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_quiz_by_id(quiz_id):
        return Quiz.query.get_or_404(quiz_id)

    @staticmethod
    def get_accessible_quizzes(user_id):
        """Get all quizzes that a user has access to through collections"""
        from app.models.user import User
        from app.models.collection import Collection
        
        user = User.query.get(user_id)
        if not user:
            return []
        
        # Get all collections the user has access to
        accessible_collections = []
        
        # Owned collections
        owned_collections = Collection.query.filter_by(user_id=user_id).all()
        accessible_collections.extend(owned_collections)
        
        # Collaborated collections
        collaborated_collections = user.collaborated_collections
        accessible_collections.extend(collaborated_collections)
        
        # Get all summaries from accessible collections
        collection_ids = [c.id for c in accessible_collections]
        summaries = Summary.query.filter(Summary.collection_id.in_(collection_ids)).all()
        
        # Get all quizzes for these summaries
        summary_ids = [s.id for s in summaries]
        quizzes = Quiz.query.filter(Quiz.summary_id.in_(summary_ids)).all()
        
        return quizzes