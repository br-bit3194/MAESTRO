from fastapi import APIRouter, HTTPException
from typing import List, Optional
from .models import MemoryItem, MemoryCreate, MemoryUpdate, MemorySearch, MemoryStats
from .storage import (
    create_memory_item, get_memory_item, update_memory_item, 
    delete_memory_item, list_memory_items, search_memory_items, get_memory_stats
)

router = APIRouter()

@router.post("/", response_model=MemoryItem)
async def create_memory(memory: MemoryCreate):
    """Create a new memory item"""
    return create_memory_item(memory.key, memory.value, memory.ttl)

@router.get("/{key}", response_model=MemoryItem)
async def get_memory(key: str):
    """Get a memory item by key"""
    item = get_memory_item(key)
    if not item:
        raise HTTPException(status_code=404, detail="Memory item not found or expired")
    return item

@router.put("/{key}", response_model=MemoryItem)
async def update_memory(key: str, memory_update: MemoryUpdate):
    """Update a memory item"""
    item = update_memory_item(key, memory_update.value, memory_update.ttl)
    if not item:
        raise HTTPException(status_code=404, detail="Memory item not found")
    return item

@router.delete("/{key}")
async def delete_memory(key: str):
    """Delete a memory item"""
    if not delete_memory_item(key):
        raise HTTPException(status_code=404, detail="Memory item not found")
    return {"message": "Memory item deleted successfully"}

@router.get("/", response_model=List[MemoryItem])
async def list_memory(limit: int = 100, pattern: Optional[str] = None):
    """List all memory items with optional pattern filtering"""
    return list_memory_items(limit, pattern)

@router.post("/search", response_model=List[MemoryItem])
async def search_memory(search: MemorySearch):
    """Search memory items by pattern"""
    return search_memory_items(search.pattern, search.limit)

@router.get("/stats", response_model=MemoryStats)
async def get_memory_statistics():
    """Get memory statistics"""
    stats = get_memory_stats()
    return MemoryStats(**stats)
