from app.utils.db import db
from app.models.base import BaseModel

class Collection(BaseModel):
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    highlights = db.relationship('Highlight', backref='collection', lazy=True)
    summaries = db.relationship('Summary', backref='collection', lazy=True)

    def __repr__(self):
        return f"<Collection {self.id} - {self.title}>"