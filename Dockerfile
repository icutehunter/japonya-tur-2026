FROM python:3.11-slim

WORKDIR /app
RUN pip install --no-cache-dir fastapi uvicorn websockets pillow python-multipart httpx

COPY server.py .
COPY index.html .

RUN mkdir -p /data/avatars
VOLUME ["/data"]
EXPOSE 1770

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "1770"]
