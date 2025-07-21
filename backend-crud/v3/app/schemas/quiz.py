from flask_marshmallow import Marshmallow
from marshmallow import fields, validate
from app.models.quiz import Quiz
from app.utils.db import db
from app.schemas.summary import summary_schema

ma = Marshmallow()

class QuizSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Quiz
        load_instance = True
        include_fk = True
        exclude = ('updated_at', 'attempts')

    summary = fields.Nested(summary_schema, dump_only=True, exclude=('collection', 'quiz'))
    questions = fields.Method('get_questions_without_correct_answer')

    def get_questions_without_correct_answer(self, obj):
        # Remove 'correct_answer' from each question for frontend
        return [
            {k: v for k, v in q.items() if k != 'correct_answer'}
            for q in obj.questions or []
        ]

class QuizCreateSchema(ma.Schema):
    summary_id = fields.Str(required=True, validate=validate.Length(equal=36))
    title = fields.Str(required=True)
    questions = fields.List(fields.Dict(), required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')

quiz_schema = QuizSchema()
quizzes_schema = QuizSchema(many=True)
quiz_create_schema = QuizCreateSchema()