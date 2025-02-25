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