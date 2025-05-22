from app.models.collection import Collection
from app.models.highlight import Highlight
from app.utils.db import db
from datetime import datetime

class CollectionFacade:
    @staticmethod
    def save_collections(collection_data_list):
        collections = []
        for data in collection_data_list:
            timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            collection = Collection(title=data['title'], description=data.get('description'), timestamp=timestamp)
            collections.append(collection)
        db.session.bulk_save_objects(collections)
        db.session.commit()
        return collections

    @staticmethod
    def get_all_collections():
        return Collection.query.all()

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
        if highlight.collection_id is None:  # Avoid reassignment if already linked
            highlight.collection_id = collection_id
            db.session.commit()
            collection.highlights_count = len(collection.highlights)  # Update highlights count
        return collection

    @staticmethod
    def get_highlights_by_collection(collection_id):
        collection = Collection.query.get_or_404(collection_id)
        return collection.highlights