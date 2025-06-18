from flask_marshmallow import Marshmallow
from marshmallow import fields, validate
from app.models.summary import Summary
from app.utils.db import db

ma = Marshmallow()

class SummarySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Summary
        load_instance = True
        include_fk = True
        exclude = ('updated_at',)

    collection = fields.Nested('CollectionSchema', dump_only=True, exclude=('summaries', 'highlights'))
    highlights = fields.Nested('HighlightSchema', many=True, dump_only=True)
    quiz = fields.Nested('QuizSchema', dump_only=True, exclude=('summary',))

class SummaryCreateSchema(ma.Schema):
    collection_id = fields.Str(required=True, validate=validate.Length(equal=36))
    highlight_ids = fields.List(fields.Str(), required=False, default=[])
    content = fields.Str(required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')

summary_schema = SummarySchema()
summaries_schema = SummarySchema(many=True)
summary_create_schema = SummaryCreateSchema()