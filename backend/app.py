import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from flask_cors import CORS
import uuid
from flasgger import Swagger
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

app = Flask(__name__)
CORS(app)

app.config['SWAGGER'] = {
    'title': 'Video API',
    'uiversion': 3,
    'specs_route': '/'
}

swagger = Swagger(app)

ENV = os.environ.get("FLASK_ENV", "development")

if ENV == "production":
    # Production settings: use MySQL.
    # Set the following environment variables: DB_USER, DB_PASSWORD, DB_HOST, DB_NAME
    DB_USER = os.environ.get("DB_USER", "user")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "password")
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_NAME = os.environ.get("DB_NAME", "dbname")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    app.config['DEBUG'] = False
    
    engine = create_engine(f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}")
    
    try:
        # Attempt to connect to MySQL and check if the database exists
        with engine.connect() as conn:
            # Query to check if the database exists
            result = conn.execute(text(f"SHOW DATABASES LIKE '{DB_NAME}'")).fetchone()

            if not result:
                # If the database does not exist, create it
                print(f"Database {DB_NAME} does not exist. Creating it now...")
                conn.execute(text(f"CREATE DATABASE {DB_NAME}"))
                print(f"Database {DB_NAME} created successfully.")

    except OperationalError as e:
        print(f"Error connecting to the MySQL server: {e}")
        
else:
    # Development settings: use SQLite.
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///videos.db'
    app.config['DEBUG'] = True

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

@app.route('/upload', methods=['POST'])
def upload_video():
    """
    Upload a video file
    ---
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: video
        type: file
        required: true
        description: The video file to upload
      - in: formData
        name: clip_name
        type: string
        required: true
        description: The clip name for the video
    responses:
      201:
        description: Video uploaded successfully
        schema:
          id: Video
          properties:
            id:
              type: integer
            clip_name:
              type: string
            url:
              type: string
      400:
        description: Error in file upload
    """
    if 'video' not in request.files or 'clip_name' not in request.form:
        return jsonify({'error': 'Missing video file or clip name'}), 400

    file = request.files['video']
    clip_name = request.form['clip_name']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)

        video = Video(clip_name=clip_name, filename=unique_filename)
        db.session.add(video)
        db.session.commit()

        return jsonify({
            'message': 'Video uploaded successfully',
            'video': video.to_dict()
        }), 201
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/videos', methods=['GET'])
def list_videos():
    """
    Retrieve a list of uploaded videos
    ---
    responses:
      200:
        description: List of videos
        schema:
          type: array
          items:
            $ref: '#/definitions/Video'
    definitions:
      Video:
        type: object
        properties:
          id:
            type: integer
          clip_name:
            type: string
          url:
            type: string
    """
    videos = Video.query.all()
    return jsonify([video.to_dict() for video in videos]), 200

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """
    Serve an uploaded video file
    ---
    parameters:
      - in: path
        name: filename
        type: string
        required: true
        description: The filename of the uploaded video
    responses:
      200:
        description: The video file is served
    """
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=app.config['DEBUG'], port=os.environ.get("PORT", 5000))
