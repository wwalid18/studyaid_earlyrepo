from app.models.collection import Collection
from app.models.highlight import Highlight
from app.models.user import User
from app.utils.db import db
from datetime import datetime
from sqlalchemy import and_

class CollectionFacade:
    @staticmethod
    def save_collections(collection_data_list):
        collections = []
        for data in collection_data_list:
            # Use current time if timestamp is not provided
            if 'timestamp' in data:
                timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            else:
                timestamp = datetime.utcnow()
                
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

    @staticmethod
    def add_highlights_to_collection(collection_id, highlight_ids, current_user_id):
        collection = Collection.query.get_or_404(collection_id)
        highlights = []
        existing_highlight_ids = {h.id for h in collection.highlights}
        
        for highlight_id in highlight_ids:
            try:
                highlight = Highlight.query.get_or_404(highlight_id)
                
                # Check if highlight is already in collection
                if highlight.id in existing_highlight_ids:
                    raise ValueError(f"Highlight {highlight_id} is already in the collection")
                
                # Verify that the current user owns the highlight or has access to it
                if highlight.user_id != current_user_id:
                    raise ValueError(f"Highlight {highlight_id} does not belong to you")
                
                # Verify that the highlight belongs to the collection owner or collaborators
                if highlight.user_id != collection.user_id and not collection.is_collaborator(User.query.get(highlight.user_id)):
                    raise ValueError(f"Highlight {highlight_id} does not belong to the collection owner or collaborators")
                    
                highlight.collection_id = collection_id
                highlights.append(highlight)
                existing_highlight_ids.add(highlight.id)  # Add to set to prevent duplicates
                
            except ValueError as e:
                # Rollback any changes if there's an error
                db.session.rollback()
                raise e
                
        db.session.commit()
        collection.highlights_count = len(collection.highlights)  # Update highlights count
        return highlights

    @staticmethod
    def remove_highlight_from_collection(collection_id, highlight_id, current_user_id):
        collection = Collection.query.get_or_404(collection_id)
        highlight = Highlight.query.get_or_404(highlight_id)
        # Only allow if user can access the collection
        user = User.query.get_or_404(current_user_id)
        if not collection.can_access(user):
            raise ValueError('Unauthorized access to collection')
        # Only remove if the highlight is in this collection
        if highlight.collection_id != collection_id:
            raise ValueError('Highlight is not in this collection')
        highlight.collection_id = None
        db.session.commit()
        collection.highlights_count = len(collection.highlights)
        return highlight

    @staticmethod
    def get_all_accessible_collections(user_id):
        user = User.query.get_or_404(user_id)
        return user.get_collections()