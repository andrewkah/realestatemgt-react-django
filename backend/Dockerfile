FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=docker

# Set work directory
WORKDIR /backend

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements-docker.txt .
RUN pip install --upgrade pip && pip install -r requirements-docker.txt

# Copy project files
COPY . .

# Expose port (default Django port)
EXPOSE 8000

# Run migrations and start server
CMD ["gunicorn", "realestatemgt.wsgi:application", "--bind", "0.0.0.0:8000"]
