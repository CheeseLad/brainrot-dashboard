# Use the official Python slim image
FROM python:latest

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Create a virtual environment in /venv
RUN python -m venv /venv

# Upgrade pip in the virtual environment
RUN /venv/bin/pip install --upgrade pip

# Install the required Python packages from requirements.txt
RUN /venv/bin/pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Set environment variables for Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV PATH="/venv/bin:$PATH"

# Expose the port that Flask runs on
EXPOSE 5000

# Run the Flask application
CMD ["flask", "run"]
