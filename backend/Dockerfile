# Base Python Image
FROM python:3.12-slim-bullseye as python

# Python build stage
FROM python as python-build-stage

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer)
COPY ./requirements.txt .
RUN pip wheel --wheel-dir /usr/src/app/wheels -r requirements.txt

# Python run stage
FROM python as python-run-stage

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
    libpq-dev \
    gettext \
    && rm -rf /var/lib/apt/lists/*

# Copy wheels from build stage
COPY --from=python-build-stage /usr/src/app/wheels /wheels/

# Install Python dependencies from wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels/ /wheels/* \
    && rm -rf /wheels/

# Copy the rest of the app code
COPY . /app

# Expose the port the app will run on
EXPOSE 8000

# Define the command to run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
