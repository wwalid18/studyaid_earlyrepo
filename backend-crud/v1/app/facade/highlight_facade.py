from app.models.highlight import Highlight
from app.utils.db import db
from datetime import datetime

class HighlightFacade:
    @staticmethod
    def save_highlights(highlight_data_list):
        highlights = []
        for data in highlight_data_list:
            # Convert timestamp string to datetime object
            timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            highlight = Highlight(url=data['url'], text=data['text'], timestamp=timestamp)
            highlights.append(highlight)
        db.session.bulk_save_objects(highlights)
        db.session.commit()
        return highlights

    @staticmethod
    def get_all_highlights():
        return Highlight.query.all()

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
        db.session.commit()
        return highlight

    @staticmethod
    def delete_highlight(highlight_id):
        highlight = Highlight.query.get_or_404(highlight_id)
        db.session.delete(highlight)
        db.session.commit()
        return True