from pydantic import BaseModel
from typing import Dict, Any

class HealthStatus(BaseModel):
    status: str
    timestamp: str
    uptime: float
    system_info: Dict[str, Any]

class ServiceHealth(BaseModel):
    service_name: str
    status: str
    response_time: float
    last_check: str

class ServiceRegistry(BaseModel):
    service_name: str
    base_url: str
    health_endpoint: str
    status: str = "unknown"
