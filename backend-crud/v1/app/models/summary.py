from app.utils.db import db
from app.models.base import BaseModel

class Summary(BaseModel):
    collection_id = db.Column(db.String(36), db.ForeignKey('collection.id'), nullable=False)
    highlight_ids = db.Column(db.JSON, nullable=False)
    summary_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<Summary {self.id} - Collection {self.collection_id}>"