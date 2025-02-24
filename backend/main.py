import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///videos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50 MB max upload size
ALLOWED_EXTENSIONS = {'mp4', 'mov', 'avi', 'mkv'}

db = SQLAlchemy(app)

# Video model
class Video(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    clip_name = db.Column(db.String(100), nullable=False)
    filename = db.Column(db.String(200), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'clip_name': self.clip_name,
            'url': request.host_url.rstrip('/') + '/uploads/' + self.filename
        }

# Helper function to check allowed file types
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Endpoint to upload a video
@app.route('/upload', methods=['POST'])
def upload_video():
    if 'video' not in request.files or 'clip_name' not in request.form:
        return jsonify({'error': 'Missing video file or clip name'}), 400

    file = request.files['video']
    clip_name = request.form['clip_name']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Secure the filename and save the file
        filename = secure_filename(file.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Save video info to database
        video = Video(clip_name=clip_name, filename=filename)
        db.session.add(video)
        db.session.commit()

        return jsonify({
            'message': 'Video uploaded successfully',
            'video': video.to_dict()
        }), 201
    else:
        return jsonify({'error': 'Invalid file type'}), 400

# Endpoint to list all videos
@app.route('/videos', methods=['GET'])
def list_videos():
    videos = Video.query.all()
    return jsonify([video.to_dict() for video in videos]), 200

# Endpoint to delete a video by ID
"""@app.route('/video/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    video = Video.query.get(video_id)
    if not video:
        return jsonify({'error': 'Video not found'}), 404

    # Remove the video file if it exists
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], video.filename)
    if os.path.exists(filepath):
        os.remove(filepath)

    # Remove the video record from the database
    db.session.delete(video)
    db.session.commit()
    return jsonify({'message': 'Video deleted successfully'}), 200"""

# Route to serve uploaded video files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Run the app
if __name__ == '__main__':
    # Create the database and tables if they don't exist
    with app.app_context():
        db.create_all()
    app.run(debug=True)
