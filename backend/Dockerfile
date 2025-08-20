# Base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy and install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy and install cli
COPY cli/ /app/cli
RUN pip install -e ./cli

# Copy backend source code
COPY backend/ /app/

# Start the server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
