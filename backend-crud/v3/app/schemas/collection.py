from flask_marshmallow import Marshmallow
from marshmallow import fields, validate
from app.models.collection import Collection
from app.utils.db import db

ma = Marshmallow()

class CollectionSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Collection
        load_instance = True
        exclude = ('updated_at',)
        include_fk = True

    title = fields.Str(required=True, validate=validate.Length(max=255))
    description = fields.Str(required=False)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    user_id = fields.Str(required=True, dump_only=True)
    highlights = fields.Nested('HighlightSchema', many=True, dump_only=True, exclude=('collection',))
    summaries = fields.Nested('SummarySchema', many=True, dump_only=True, exclude=('collection',))
    highlights_count = fields.Int(dump_only=True)
    owner = fields.Nested('UserBaseSchema', only=('id', 'username'), dump_only=True)
    collaborators = fields.Nested('UserBaseSchema', only=('id', 'username', 'email'), many=True, dump_only=True)

class CollectionCreateSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Collection
        load_instance = True
        exclude = ('id', 'user_id')

    title = fields.Str(required=True, validate=validate.Length(max=255))
    description = fields.Str(required=False)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')

collection_schema = CollectionSchema()
collections_schema = CollectionSchema(many=True)
collection_create_schema = CollectionCreateSchema()