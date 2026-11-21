# 1. Aşama: React + Vite Arayüzünü Derle
FROM node:20-alpine AS frontend-builder
WORKDIR /ui
COPY package.json .
COPY index.html .
COPY src ./src
RUN npm install && npm run build

# 2. Aşama: Python FastAPI + SQLite + WebSocket Sunucusu
FROM python:3.11-slim
WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn websockets pillow python-multipart httpx

COPY server.py .
COPY --from=frontend-builder /ui/dist ./dist

RUN mkdir -p /data/avatars
VOLUME ["/data"]
EXPOSE 1770

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "1770"]
