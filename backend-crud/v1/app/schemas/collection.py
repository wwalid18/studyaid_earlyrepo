from marshmallow import Schema, fields, validate

class CollectionSchema(Schema):
    id = fields.Str(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(max=255))
    description = fields.Str(required=False)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    updated_at = fields.DateTime(dump_only=True, format='%Y-%m-%dT%H:%M:%S')
    highlights_count = fields.Int(dump_only=True)

collection_schema = CollectionSchema()
collections_schema = CollectionSchema(many=True)