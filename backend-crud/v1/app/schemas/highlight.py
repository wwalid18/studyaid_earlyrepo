from marshmallow import Schema, fields, validate

class HighlightSchema(Schema):
    id = fields.Str(dump_only=True)
    url = fields.Str(required=True, validate=validate.Length(max=2048))
    text = fields.Str(required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    updated_at = fields.DateTime(dump_only=True, format='%Y-%m-%dT%H:%M:%S')

highlight_schema = HighlightSchema()
highlights_schema = HighlightSchema(many=True)