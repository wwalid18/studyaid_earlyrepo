from app.utils.db import db
import uuid
from datetime import datetime

class BaseModel(db.Model):
    __abstract__ = True  # Prevents SQLAlchemy from creating a table for this class

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<{self.__class__.__name__} {self.id}>"