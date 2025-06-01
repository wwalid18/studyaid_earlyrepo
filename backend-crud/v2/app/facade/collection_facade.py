from app.models.collection import Collection
from app.models.highlight import Highlight
from app.utils.db import db
from datetime import datetime
from sqlalchemy import and_

class CollectionFacade:
    @staticmethod
    def save_collections(collection_data_list):
        collections = []
        for data in collection_data_list:
            timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            collection = Collection(
                title=data['title'],
                description=data.get('description'),
                timestamp=timestamp,
                user_id=data['user_id']
            )
            collections.append(collection)
        db.session.add_all(collections)
        db.session.commit()
        return collections

    @staticmethod
    def get_user_collections(user_id):
        return Collection.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_collection_by_id(collection_id):
        collection = Collection.query.get_or_404(collection_id)
        collection.highlights_count = len(collection.highlights)  # Compute highlights count
        return collection

    @staticmethod
    def update_collection(collection_id, data):
        collection = Collection.query.get_or_404(collection_id)
        collection.title = data.get('title', collection.title)
        collection.description = data.get('description', collection.description)
        if 'timestamp' in data:
            collection.timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
        db.session.commit()
        collection.highlights_count = len(collection.highlights)  # Update highlights count
        return collection

    @staticmethod
    def delete_collection(collection_id):
        collection = Collection.query.get_or_404(collection_id)
        db.session.delete(collection)
        db.session.commit()
        return True

    @staticmethod
    def add_highlight_to_collection(collection_id, highlight_id):
        collection = Collection.query.get_or_404(collection_id)
        highlight = Highlight.query.get_or_404(highlight_id)
        
        # Verify that both collection and highlight belong to the same user
        if collection.user_id != highlight.user_id:
            raise ValueError("Cannot add highlight from a different user")
            
        highlight.collection_id = collection_id
        db.session.commit()
        collection.highlights_count = len(collection.highlights)  # Update highlights count
        return collection

    @staticmethod
    def get_highlights_by_collection(collection_id):
        collection = Collection.query.get_or_404(collection_id)
        return collection.highlights

    @staticmethod
    def get_collections_by_user_and_highlight(user_id, highlight_id):
        """Get all collections that belong to a user and contain a specific highlight"""
        return Collection.query.join(Highlight).filter(
            and_(
                Collection.user_id == user_id,
                Highlight.id == highlight_id
            )
        ).all()