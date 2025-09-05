# MAESTRO
MAESTRO - Multi-Agent Enterprise Service Transformation & Resolution Orchestrator

## Overview
MAESTRO is a microservices-based system consisting of five FastAPI services that work together to provide comprehensive enterprise functionality including ticket management, health monitoring, memory storage, workflow orchestration, and code execution sandboxing.

## Architecture

### Services

1. **Ticket Service** (Port 8001)
   - Manages support tickets and requests
   - CRUD operations for tickets
   - Priority and status management
   - Assignment tracking

2. **Healthcheck Service** (Port 8002)
   - Monitors system health and service status
   - System resource monitoring (CPU, memory, disk)
   - Service availability checks
   - Health metrics collection

3. **Memory Service** (Port 8003)
   - In-memory key-value storage
   - TTL (Time To Live) support
   - Pattern-based search
   - Memory statistics and cleanup

4. **Orchestrator Service** (Port 8004)
   - Workflow management and execution
   - Service coordination
   - Task orchestration
   - Service registry management

5. **Sandbox Service** (Port 8005)
   - Secure code execution environment
   - Multi-language support (Python, JavaScript, Bash)
   - Asynchronous and synchronous execution
   - Execution monitoring and statistics

## Quick Start

### Prerequisites
- Python 3.11+
- Docker and Docker Compose (optional)

### Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start individual services:**
   ```bash
   # Terminal 1 - Ticket Service
   cd ticket && python main.py

   # Terminal 2 - Healthcheck Service
   cd healthcheck && python main.py

   # Terminal 3 - Memory Service
   cd memory && python main.py

   # Terminal 4 - Orchestrator Service
   cd orchestrator && python main.py

   # Terminal 5 - Sandbox Service
   cd sandbox && python main.py
   ```

### Docker Deployment

1. **Start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Start in background:**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## API Documentation

Once the services are running, you can access the interactive API documentation:

- **Ticket Service**: http://localhost:8001/docs
- **Healthcheck Service**: http://localhost:8002/docs
- **Memory Service**: http://localhost:8003/docs
- **Orchestrator Service**: http://localhost:8004/docs
- **Sandbox Service**: http://localhost:8005/docs

## Service Endpoints

### Ticket Service (8001)
- `GET /` - Service status
- `GET /health` - Health check
- `POST /tickets` - Create ticket
- `GET /tickets` - List tickets
- `GET /tickets/{id}` - Get ticket
- `PUT /tickets/{id}` - Update ticket
- `DELETE /tickets/{id}` - Delete ticket

### Healthcheck Service (8002)
- `GET /` - Service status
- `GET /health` - Health check with system info
- `GET /services` - Check all services
- `GET /services/{name}` - Check specific service

### Memory Service (8003)
- `GET /` - Service status
- `GET /health` - Health check
- `POST /memory` - Store data
- `GET /memory/{key}` - Retrieve data
- `PUT /memory/{key}` - Update data
- `DELETE /memory/{key}` - Delete data
- `GET /memory` - List all data
- `POST /memory/search` - Search data
- `GET /memory/stats` - Memory statistics

### Orchestrator Service (8004)
- `GET /` - Service status
- `GET /health` - Health check
- `GET /services` - List registered services
- `GET /services/{name}` - Get service info
- `POST /workflows` - Create workflow
- `GET /workflows` - List workflows
- `GET /workflows/{id}` - Get workflow
- `POST /workflows/{id}/execute` - Execute workflow
- `DELETE /workflows/{id}` - Delete workflow
- `GET /workflows/{id}/status` - Get workflow status

### Sandbox Service (8005)
- `GET /` - Service status
- `GET /health` - Health check
- `GET /environments` - List available environments
- `POST /execute` - Execute code (async)
- `POST /execute/sync` - Execute code (sync)
- `GET /executions` - List executions
- `GET /executions/{id}` - Get execution
- `DELETE /executions/{id}` - Delete execution
- `GET /executions/{id}/output` - Get execution output
- `GET /stats` - Execution statistics

## Example Usage

### Creating a Ticket
```bash
curl -X POST "http://localhost:8001/tickets" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Bug Report",
    "description": "Application crashes on startup",
    "priority": "high",
    "category": "bug"
  }'
```

### Storing Data in Memory
```bash
curl -X POST "http://localhost:8003/memory" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "user_session",
    "value": {"user_id": 123, "role": "admin"},
    "ttl": 3600
  }'
```

### Executing Code in Sandbox
```bash
curl -X POST "http://localhost:8005/execute/sync" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "code": "print(\"Hello, MAESTRO!\")",
    "timeout": 10
  }'
```

### Creating and Executing a Workflow
```bash
# Create workflow
curl -X POST "http://localhost:8004/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Data Processing Workflow",
    "description": "Process data and store results",
    "tasks": [
      {
        "name": "Get Data",
        "service": "memory",
        "endpoint": "/memory/data_key",
        "method": "GET"
      },
      {
        "name": "Process Data",
        "service": "sandbox",
        "endpoint": "/execute/sync",
        "method": "POST",
        "payload": {
          "language": "python",
          "code": "result = data * 2"
        }
      }
    ]
  }'

# Execute workflow
curl -X POST "http://localhost:8004/workflows/{workflow_id}/execute"
```

## Frontend Dashboard

A React + Tailwind CSS dashboard is available in the `frontend/` directory:

- **Health Status Card** with dummy system data
- **Tickets Table** with static sample data  
- **Health Check Button** (ready for API integration)
- **Service Overview** showing all 5 services

### Quick Start Frontend
```bash
cd frontend
npm install
npm start
```
Open http://localhost:3000

## Development

### Project Structure
```
MAESTRO/
├── frontend/               # React + Tailwind dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── ticket/                 # Ticket management service
│   ├── main.py
│   ├── models.py
│   ├── routes.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
├── healthcheck/            # Health monitoring service
│   ├── main.py
│   ├── models.py
│   ├── routes.py
│   ├── services.py
│   ├── requirements.txt
│   └── Dockerfile
├── memory/                 # Memory storage service
│   ├── main.py
│   ├── models.py
│   ├── routes.py
│   ├── storage.py
│   ├── requirements.txt
│   └── Dockerfile
├── orchestrator/           # Workflow orchestration service
│   ├── main.py
│   ├── models.py
│   ├── routes.py
│   ├── services.py
│   ├── requirements.txt
│   └── Dockerfile
├── sandbox/                # Code execution service
│   ├── main.py
│   ├── models.py
│   ├── routes.py
│   ├── executor.py
│   ├── requirements.txt
│   └── Dockerfile
├── requirements.txt        # Shared dependencies
├── docker-compose.yml      # Docker orchestration
└── README.md
```

### Adding New Services

1. Create a new directory for your service
2. Add `main.py` with FastAPI application
3. Add `requirements.txt` with dependencies
4. Add `Dockerfile` for containerization
5. Update `docker-compose.yml` to include the new service
6. Register the service in the orchestrator's service registry

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the SuperHacks 2025 hackathon.
