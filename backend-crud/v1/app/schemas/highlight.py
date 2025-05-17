from marshmallow import Schema, fields

class HighlightSchema(Schema):
    id = fields.Int(dump_only=True)
    url = fields.Str(required=True)
    text = fields.Str(required=True)
    timestamp = fields.DateTime(required=True)

highlight_schema = HighlightSchema()
highlights_schema = HighlightSchema(many=True)
