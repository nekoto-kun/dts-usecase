FROM python:3.13.3-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for SQLite with appropriate permissions
# and create a non-root user
RUN mkdir -p data && \
  chmod 755 data && \
  groupadd -r appuser -g 1001 && \
  useradd -r -g appuser -u 1001 -d /app appuser && \
  chown -R appuser:appuser /app

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=5000
ENV FLASK_DEBUG=False

EXPOSE 5000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

# Switch to non-root user
USER appuser

# Run the application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()", "--workers", "3"]