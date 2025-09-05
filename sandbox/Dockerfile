FROM python:3.11-slim

WORKDIR /app

# Install Node.js for JavaScript execution
RUN apt-get update && apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8005

CMD ["python", "main.py"]
