from app.models.summary import Summary
from app.models.collection import Collection
from app.models.highlight import Highlight
from app.utils.db import db
from datetime import datetime
from app.utils.constants import STATIC_SUMMARY_TEXT

class SummaryFacade:
    @staticmethod
    def save_summary(data):
        collection_id = data['collection_id']
        highlight_ids = data['highlight_ids']
        user_id = data['user_id']
        content = data.get('content', STATIC_SUMMARY_TEXT)
        timestamp = data.get('timestamp', datetime.utcnow())

        # Check if a summary with the same highlights already exists for this collection
        if not Summary.can_generate_summary(collection_id, highlight_ids):
            raise ValueError("A summary with these highlights already exists for this collection")

        # Create the summary
        summary = Summary(
            collection_id=collection_id,
            user_id=user_id,
            content=content,
            timestamp=timestamp
        )
        db.session.add(summary)

        # Add highlights to the summary
        highlights = Highlight.query.filter(Highlight.id.in_(highlight_ids)).all()
        summary.highlights = highlights

        db.session.commit()
        return summary

    @staticmethod
    def update_summary(summary_id, data):
        summary = Summary.query.get_or_404(summary_id)
        
        if 'content' in data:
            summary.content = data['content']
        if 'timestamp' in data:
            summary.timestamp = data['timestamp']
        if 'highlight_ids' in data:
            highlights = Highlight.query.filter(Highlight.id.in_(data['highlight_ids'])).all()
            summary.highlights = highlights

        summary.updated_at = datetime.utcnow()
        db.session.commit()
        return summary

    @staticmethod
    def delete_summary(summary_id):
        summary = Summary.query.get_or_404(summary_id)
        db.session.delete(summary)
        db.session.commit()
        return True

    @staticmethod
    def get_user_summaries(user_id):
        return Summary.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_summary_by_id(summary_id):
        return Summary.query.get_or_404(summary_id)

    @staticmethod
    def get_summaries_by_collection(collection_id):
        return Summary.query.filter_by(collection_id=collection_id).all()