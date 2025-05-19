from marshmallow import Schema, fields, validate

class QuizSchema(Schema):
    id = fields.Str(dump_only=True)
    summary_id = fields.Str(required=True, validate=validate.Length(equal=36))
    quiz_text = fields.Str(required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    updated_at = fields.DateTime(dump_only=True, format='%Y-%m-%dT%H:%M:%S')

quiz_schema = QuizSchema()
quizzes_schema = QuizSchema(many=True)