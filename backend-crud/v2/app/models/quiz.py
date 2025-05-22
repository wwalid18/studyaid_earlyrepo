from app.utils.db import db
from app.models.base import BaseModel

class Quiz(BaseModel):
    summary_id = db.Column(db.String(36), db.ForeignKey('summary.id'), nullable=False, unique=True)
    quiz_text = db.Column(db.JSON, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<Quiz {self.id} - Summary {self.summary_id}>"