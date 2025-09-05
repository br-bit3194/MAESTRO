from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from enum import Enum

class WorkflowStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

class Task(BaseModel):
    id: str
    name: str
    service: str
    endpoint: str
    method: str = "GET"
    payload: Optional[Dict[str, Any]] = None
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class Workflow(BaseModel):
    id: str
    name: str
    description: str
    tasks: List[Task]
    status: WorkflowStatus = WorkflowStatus.PENDING
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

class WorkflowCreate(BaseModel):
    name: str
    description: str
    tasks: List[Dict[str, Any]]

class ServiceRegistry(BaseModel):
    service_name: str
    base_url: str
    health_endpoint: str
    status: str = "unknown"

class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    status: str
    total_tasks: int
    completed_tasks: int
    failed_tasks: int
    running_tasks: int
    pending_tasks: int
