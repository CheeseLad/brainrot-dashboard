FROM python:3.13.2-slim

WORKDIR /app

COPY requirements.txt .

RUN python -m venv /venv
RUN /venv/bin/pip install --upgrade pip
RUN /venv/bin/pip install -r requirements.txt

COPY . .

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV PATH="/venv/bin:$PATH"

EXPOSE 5000

CMD ["flask", "run"]
