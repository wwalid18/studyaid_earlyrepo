from app.models.highlight import Highlight
from app.models.collection import Collection
from app.utils.db import db
from datetime import datetime
from sqlalchemy import and_

class HighlightFacade:
    @staticmethod
    def save_highlights(highlight_data_list):
        highlights = []
        for data in highlight_data_list:
            timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            collection_id = data.get('collection_id')
            highlight = Highlight(
                url=data['url'],
                text=data['text'],
                timestamp=timestamp,
                collection_id=collection_id,
                user_id=data['user_id']
            )
            highlights.append(highlight)
        db.session.add_all(highlights)
        db.session.commit()
        return highlights

    @staticmethod
    def get_user_highlights(user_id):
        return Highlight.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_highlight_by_id(highlight_id):
        return Highlight.query.get_or_404(highlight_id)

    @staticmethod
    def update_highlight(highlight_id, data):
        highlight = Highlight.query.get_or_404(highlight_id)
        highlight.url = data.get('url', highlight.url)
        highlight.text = data.get('text', highlight.text)
        if 'timestamp' in data:
            highlight.timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        if 'collection_id' in data:
            highlight.collection_id = data['collection_id']
        db.session.commit()
        return highlight

    @staticmethod
    def delete_highlight(highlight_id):
        highlight = Highlight.query.get_or_404(highlight_id)
        db.session.delete(highlight)
        db.session.commit()
        return True

    @staticmethod
    def get_highlights_by_collection(collection_id, user_id):
        """Get all highlights that belong to a user and are in a specific collection"""
        return Highlight.query.filter(
            and_(
                Highlight.collection_id == collection_id,
                Highlight.user_id == user_id
            )
        ).all()

    @staticmethod
    def get_highlights_by_url(url, user_id):
        """Get all highlights that belong to a user and are from a specific URL"""
        return Highlight.query.filter(
            and_(
                Highlight.url == url,
                Highlight.user_id == user_id
            )
        ).all()

    @staticmethod
    def move_highlight_to_collection(highlight_id, collection_id, user_id):
        """Move a highlight to a different collection, ensuring user ownership"""
        highlight = Highlight.query.get_or_404(highlight_id)
        if highlight.user_id != user_id:
            raise ValueError("Unauthorized access to highlight")

        if collection_id:
            collection = Collection.query.get_or_404(collection_id)
            if collection.user_id != user_id:
                raise ValueError("Unauthorized access to collection")

        highlight.collection_id = collection_id
        db.session.commit()
        return highlight