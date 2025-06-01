from app import create_app, db
from app.models.user import User
from app.models.collection import Collection
from app.models.highlight import Highlight
from app.models.summary import Summary
from app.models.quiz import Quiz
from datetime import datetime
import uuid

def init_test_data():
    app = create_app()
    with app.app_context():
        # Create test users
        user1 = User(
            id=str(uuid.uuid4()),
            username='testuser1',
            email='test1@example.com',
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        user1.set_password('password123')

        user2 = User(
            id=str(uuid.uuid4()),
            username='testuser2',
            email='test2@example.com',
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        user2.set_password('password123')

        db.session.add_all([user1, user2])
        db.session.commit()

        # Create test collection
        collection = Collection(
            id=str(uuid.uuid4()),
            title='Test Collection',
            description='A test collection for development',
            timestamp=datetime.utcnow(),
            user_id=user1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(collection)
        db.session.commit()

        # Add user2 as collaborator
        collection.add_collaborator(user2)

        # Create test highlights
        highlight1 = Highlight(
            id=str(uuid.uuid4()),
            url='https://example.com/article1',
            text='This is a test highlight from user 1',
            timestamp=datetime.utcnow(),
            collection_id=collection.id,
            user_id=user1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        highlight2 = Highlight(
            id=str(uuid.uuid4()),
            url='https://example.com/article2',
            text='This is a test highlight from user 2',
            timestamp=datetime.utcnow(),
            collection_id=collection.id,
            user_id=user2.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.session.add_all([highlight1, highlight2])
        db.session.commit()

        # Create test summary
        summary = Summary(
            id=str(uuid.uuid4()),
            content='This is a test summary of the highlights. It provides a concise overview of the main points discussed in the articles.',
            timestamp=datetime.utcnow(),
            collection_id=collection.id,
            user_id=user1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        summary.highlights = [highlight1, highlight2]
        db.session.add(summary)
        db.session.commit()

        # Create test quiz
        quiz = Quiz(
            id=str(uuid.uuid4()),
            title='Test Quiz',
            questions={
                'questions': [
                    {
                        'question': 'What is the main topic of the first article?',
                        'options': ['Topic A', 'Topic B', 'Topic C', 'Topic D'],
                        'correct_answer': 0
                    },
                    {
                        'question': 'What is discussed in the second article?',
                        'options': ['Point 1', 'Point 2', 'Point 3', 'Point 4'],
                        'correct_answer': 1
                    }
                ]
            },
            timestamp=datetime.utcnow(),
            summary_id=summary.id,
            user_id=user1.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        db.session.add(quiz)
        db.session.commit()

if __name__ == '__main__':
    init_test_data() 