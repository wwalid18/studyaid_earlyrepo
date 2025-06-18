from flask_marshmallow import Marshmallow
from marshmallow import fields, validate
from app.models.highlight import Highlight
from app.utils.db import db
from app.schemas.collection import collection_schema

ma = Marshmallow()

class HighlightSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Highlight
        load_instance = True
        include_fk = True
        exclude = ('updated_at',)

    url = fields.Str(required=True, validate=validate.Length(max=2048))
    text = fields.Str(required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    collection_id = fields.Str(required=False, allow_none=True)
    user_id = fields.Str(required=True, dump_only=True)
    user = fields.Nested('UserBaseSchema', dump_only=True, exclude=('highlights',))
    collection = fields.Nested(collection_schema, dump_only=True, exclude=('highlights', 'summaries'), allow_none=True)

class HighlightCreateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Highlight
        load_instance = True
        exclude = ('id', 'user_id')

    url = fields.Str(required=True, validate=validate.Length(max=2048))
    text = fields.Str(required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    collection_id = fields.Str(required=False, allow_none=True)

highlight_schema = HighlightSchema()
highlights_schema = HighlightSchema(many=True)
highlight_create_schema = HighlightCreateSchema()