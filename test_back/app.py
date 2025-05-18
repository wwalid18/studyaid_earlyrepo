from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the extension

# File to store highlights
HIGHLIGHTS_FILE = 'highlights.json'

# Load existing highlights or initialize an empty list
if os.path.exists(HIGHLIGHTS_FILE):
    with open(HIGHLIGHTS_FILE, 'r') as f:
        highlights = json.load(f)
else:
    highlights = []

@app.route('/highlights', methods=['POST'])
def save_highlights():
    global highlights
    data = request.get_json()
    
    if not isinstance(data, list):
        return jsonify({'error': 'Data must be an array'}), 400

    # Append new highlights
    highlights.extend(data)

    # Save to file
    with open(HIGHLIGHTS_FILE, 'w') as f:
        json.dump(highlights, f, indent=2)
    
    print(f'Highlights saved: {data}')
    return jsonify({'message': 'Highlights saved successfully', 'data': data})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)