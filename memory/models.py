from pydantic import BaseModel
from typing import Dict, Any, Optional, List

class MemoryItem(BaseModel):
    key: str
    value: Any
    ttl: Optional[int] = None  # Time to live in seconds
    created_at: str
    expires_at: Optional[str] = None

class MemoryCreate(BaseModel):
    key: str
    value: Any
    ttl: Optional[int] = None

class MemoryUpdate(BaseModel):
    value: Any
    ttl: Optional[int] = None

class MemorySearch(BaseModel):
    pattern: str
    limit: int = 100

class MemoryStats(BaseModel):
    total_items: int
    expired_items: int
    active_items: int
    total_size_bytes: int
    timestamp: str
