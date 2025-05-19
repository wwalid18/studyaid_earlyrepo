from marshmallow import Schema, fields, validate

class SummarySchema(Schema):
    id = fields.Str(dump_only=True)
    collection_id = fields.Str(required=True, validate=validate.Length(equal=36))
    highlight_ids = fields.List(fields.Str(), required=True)
    summary_text = fields.Str(required=True)
    timestamp = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    updated_at = fields.DateTime(dump_only=True, format='%Y-%m-%dT%H:%M:%S')

summary_schema = SummarySchema()
summaries_schema = SummarySchema(many=True)