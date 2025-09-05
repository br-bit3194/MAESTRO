from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"

class Language(str, Enum):
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    BASH = "bash"

class CodeExecution(BaseModel):
    id: str
    language: Language
    code: str
    input_data: Optional[str] = None
    timeout: int = 30
    status: ExecutionStatus = ExecutionStatus.PENDING
    output: Optional[str] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class CodeExecutionRequest(BaseModel):
    language: Language
    code: str
    input_data: Optional[str] = None
    timeout: int = 30

class SandboxEnvironment(BaseModel):
    id: str
    name: str
    language: Language
    status: str
    created_at: str
    last_used: str

class ExecutionOutput(BaseModel):
    execution_id: str
    status: str
    output: Optional[str] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None

class ExecutionStats(BaseModel):
    total_executions: int
    completed_executions: int
    failed_executions: int
    running_executions: int
    success_rate: float
    timestamp: str
