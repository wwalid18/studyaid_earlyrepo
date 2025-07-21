from app.models.summary import Summary
from app.models.collection import Collection
from app.models.highlight import Highlight
from app.utils.db import db
from datetime import datetime
from app.utils.constants import STATIC_SUMMARY_TEXT
from app.utils.ai_service import AIService

class SummaryFacade:
    @staticmethod
    def save_summary(data):
        collection_id = data['collection_id']
        highlight_ids = data['highlight_ids']
        user_id = data['user_id']
        content = data.get('content')
        timestamp = data.get('timestamp', datetime.utcnow())

        # Get highlights and collection
        highlights = Highlight.query.filter(Highlight.id.in_(highlight_ids)).all()
        collection = Collection.query.get(collection_id)
        
        if not highlights:
            raise ValueError("No highlights found for the provided IDs")

        # Generate AI summary if content not provided
        if not content:
            try:
                ai_service = AIService()
                content = ai_service.generate_summary_from_highlights(
                    highlights, 
                    collection.title if collection else None
                )
            except Exception as e:
                # Fallback to static content if AI fails
                content = STATIC_SUMMARY_TEXT
                print(f"AI summary generation failed, using fallback: {str(e)}")

        # Create the summary
        summary = Summary(
            collection_id=collection_id,
            user_id=user_id,
            content=content,
            timestamp=timestamp
        )
        db.session.add(summary)

        # Add highlights to the summary
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
        # Delete related quiz if it exists
        if summary.quiz:
            db.session.delete(summary.quiz)
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

    @staticmethod
    def regenerate_summary_with_ai(summary_id):
        """Regenerate a summary using AI with the same highlights"""
        summary = Summary.query.get_or_404(summary_id)
        
        if not summary.highlights:
            raise ValueError("No highlights associated with this summary")
        
        try:
            ai_service = AIService()
            collection = Collection.query.get(summary.collection_id)
            
            new_content = ai_service.generate_summary_from_highlights(
                summary.highlights,
                collection.title if collection else None
            )
            
            summary.content = new_content
            summary.updated_at = datetime.utcnow()
            db.session.commit()
            
            return summary
            
        except Exception as e:
            raise Exception(f"Failed to regenerate summary with AI: {str(e)}")