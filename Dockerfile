FROM python:3.12-slim AS backend
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app
RUN apt-get update && apt-get install -y \ 
    gcc \
    pkg-config \
    libmariadb-dev \
    libmariadb-dev-compat \
    libpq-dev \
    build-essential \ 
    && rm -rf /var/lib/apt/lists/*

# Create the virtual env
RUN python -m venv /opt/venv

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

FROM node:alpine3.23 AS frontend

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# FINAL STAGE
FROM python:3.12-slim

WORKDIR /app
COPY --from=backend backend/ ./backend/

COPY --from=frontend /app/dist ./frontend/dist

EXPOSE 8085

CMD [ "python", "backend/manage.py", "runserver", "0.0.0.0:8085" ]

