FROM python:3.12-slim as backend

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

FROM node:alpine3.23 as frontend

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# FINAL STAGE
FROM python:3.12-slim

WORKDIR /app
COPY --from=backend /install /usr/local
COPY backend/ ./backend/

COPY --from=frontend /app/dist ./frontend/dist

EXPOSE 8085

CMD [ "python", "backend/manage.py", "runserver", "0.0.0.0:8085" ]

