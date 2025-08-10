FROM python:3.11-slim
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir uvicorn fastapi httpx
COPY server.py server.py
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:8000/healthz || exit 1
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]

