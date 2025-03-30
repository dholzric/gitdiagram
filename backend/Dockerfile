# Use Python 3.12 slim image for smaller size
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN apt-get update && apt-get install -y dos2unix && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create and set permissions for entrypoint script
COPY entrypoint.sh /app/
RUN chmod +x /app/entrypoint.sh && dos2unix /app/entrypoint.sh

# Expose port
EXPOSE 8000

# Use entrypoint script
CMD ["/bin/bash", "/app/entrypoint.sh"]
