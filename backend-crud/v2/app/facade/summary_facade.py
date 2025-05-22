from app.models.summary import Summary
from app.models.collection import Collection
from app.utils.db import db
from datetime import datetime
from app.utils.constants import STATIC_SUMMARY_TEXT

class SummaryFacade:
    @staticmethod
    def save_summary(collection_id, highlight_ids, summary_text=None):
        # Check if a summary with the same highlight_ids already exists for this collection
        existing_summary = Summary.query.filter_by(
            collection_id=collection_id,
            highlight_ids=highlight_ids
        ).first()
        if existing_summary:
            return existing_summary

        # Use provided summary_text or fall back to static summary
        summary_text = summary_text or STATIC_SUMMARY_TEXT

        # Verify all highlight_ids are valid (optional, can be expanded later)
        collection = Collection.query.get_or_404(collection_id)
        timestamp = datetime.utcnow()
        summary = Summary(
            collection_id=collection_id,
            highlight_ids=highlight_ids,
            summary_text=summary_text,
            timestamp=timestamp
        )
        db.session.add(summary)
        db.session.commit()
        return summary

    @staticmethod
    def update_summary(summary_id, data):
        summary = Summary.query.get_or_404(summary_id)
        summary.summary_text = data.get('summary_text', summary.summary_text)
        if 'highlight_ids' in data:
            summary.highlight_ids = data['highlight_ids']
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
    def get_all_summaries():
        return Summary.query.all()

    @staticmethod
    def get_summary_by_id(summary_id):
        return Summary.query.get_or_404(summary_id)

    @staticmethod
    def get_summaries_by_collection(collection_id):
        collection = Collection.query.get_or_404(collection_id)
        return collection.summaries