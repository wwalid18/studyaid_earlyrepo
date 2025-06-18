from flask_marshmallow import Marshmallow
from marshmallow import fields
from app.models.quiz_attempt import QuizAttempt
from app.utils.db import db

ma = Marshmallow()

class QuizAttemptSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = QuizAttempt
        load_instance = True
        sqla_session = db.session
        exclude = ('updated_at', 'user')

    quiz = fields.Nested('QuizSchema', dump_only=True, exclude=('attempts',))

class QuizAttemptCreateSchema(ma.Schema):
    answers = fields.List(fields.Str(), required=True)  # e.g., ["A", "C", "B", "D"]

quiz_attempt_schema = QuizAttemptSchema()
quiz_attempts_schema = QuizAttemptSchema(many=True)
quiz_attempt_create_schema = QuizAttemptCreateSchema() 