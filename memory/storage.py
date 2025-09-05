import time
import json
import hashlib
from typing import Dict, List, Optional
from .models import MemoryItem

# In-memory storage (replace with Redis or database in production)
memory_store: Dict[str, MemoryItem] = {}

def generate_key_hash(key: str) -> str:
    """Generate a hash for the key to ensure consistency"""
    return hashlib.md5(key.encode()).hexdigest()

def is_expired(item: MemoryItem) -> bool:
    """Check if a memory item has expired"""
    if item.expires_at is None:
        return False
    return time.time() > time.mktime(time.strptime(item.expires_at, "%Y-%m-%dT%H:%M:%SZ"))

def cleanup_expired():
    """Remove expired items from memory store"""
    expired_keys = []
    for key, item in memory_store.items():
        if is_expired(item):
            expired_keys.append(key)
    
    for key in expired_keys:
        del memory_store[key]

def create_memory_item(key: str, value: Any, ttl: Optional[int] = None) -> MemoryItem:
    """Create a new memory item"""
    cleanup_expired()
    
    key_hash = generate_key_hash(key)
    current_time = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    expires_at = None
    if ttl:
        expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", 
                                 time.gmtime(time.time() + ttl))
    
    memory_item = MemoryItem(
        key=key,
        value=value,
        ttl=ttl,
        created_at=current_time,
        expires_at=expires_at
    )
    
    memory_store[key_hash] = memory_item
    return memory_item

def get_memory_item(key: str) -> Optional[MemoryItem]:
    """Get a memory item by key"""
    cleanup_expired()
    
    key_hash = generate_key_hash(key)
    if key_hash in memory_store:
        item = memory_store[key_hash]
        if not is_expired(item):
            return item
        else:
            del memory_store[key_hash]
    
    return None

def update_memory_item(key: str, value: Any, ttl: Optional[int] = None) -> Optional[MemoryItem]:
    """Update a memory item"""
    cleanup_expired()
    
    key_hash = generate_key_hash(key)
    if key_hash not in memory_store:
        return None
    
    current_time = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    item = memory_store[key_hash]
    
    # Update value
    item.value = value
    
    # Update TTL if provided
    if ttl is not None:
        item.ttl = ttl
        if ttl > 0:
            item.expires_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", 
                                          time.gmtime(time.time() + ttl))
        else:
            item.expires_at = None
    
    memory_store[key_hash] = item
    return item

def delete_memory_item(key: str) -> bool:
    """Delete a memory item"""
    cleanup_expired()
    
    key_hash = generate_key_hash(key)
    if key_hash in memory_store:
        del memory_store[key_hash]
        return True
    
    return False

def list_memory_items(limit: int = 100, pattern: Optional[str] = None) -> List[MemoryItem]:
    """List memory items with optional pattern filtering"""
    cleanup_expired()
    
    items = list(memory_store.values())
    
    if pattern:
        import re
        pattern_re = re.compile(pattern, re.IGNORECASE)
        items = [item for item in items if pattern_re.search(item.key)]
    
    # Sort by creation time (newest first)
    items.sort(key=lambda x: x.created_at, reverse=True)
    
    return items[:limit]

def search_memory_items(pattern: str, limit: int = 100) -> List[MemoryItem]:
    """Search memory items by pattern"""
    cleanup_expired()
    
    import re
    pattern_re = re.compile(pattern, re.IGNORECASE)
    matching_items = []
    
    for item in memory_store.values():
        if pattern_re.search(item.key) or pattern_re.search(str(item.value)):
            matching_items.append(item)
    
    # Sort by creation time (newest first)
    matching_items.sort(key=lambda x: x.created_at, reverse=True)
    
    return matching_items[:limit]

def get_memory_stats() -> Dict[str, any]:
    """Get memory statistics"""
    cleanup_expired()
    
    total_items = len(memory_store)
    expired_count = 0
    total_size = 0
    
    for item in memory_store.values():
        if is_expired(item):
            expired_count += 1
        total_size += len(json.dumps(item.dict()))
    
    return {
        "total_items": total_items,
        "expired_items": expired_count,
        "active_items": total_items - expired_count,
        "total_size_bytes": total_size,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }
