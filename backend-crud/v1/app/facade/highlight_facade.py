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
