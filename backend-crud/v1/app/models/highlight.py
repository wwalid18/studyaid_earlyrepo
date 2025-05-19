from app.utils.db import db
from app.models.base import BaseModel

class Highlight(BaseModel):
    url = db.Column(db.String(2048), nullable=False)
    text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)
    collection_id = db.Column(db.String(36), db.ForeignKey('collection.id'), nullable=True)

    def __repr__(self):
        return f"<Highlight {self.id} - {self.url}>"