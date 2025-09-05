import time
import psutil
import platform
import aiohttp
import asyncio
from typing import Dict, List
from .models import ServiceHealth, ServiceRegistry

# Service registry (in production, this would be a database or service discovery)
registered_services = {
    "ticket": ServiceRegistry(
        service_name="ticket",
        base_url="http://localhost:8001",
        health_endpoint="/health"
    ),
    "memory": ServiceRegistry(
        service_name="memory",
        base_url="http://localhost:8003",
        health_endpoint="/health"
    ),
    "orchestrator": ServiceRegistry(
        service_name="orchestrator",
        base_url="http://localhost:8004",
        health_endpoint="/health"
    ),
    "sandbox": ServiceRegistry(
        service_name="sandbox",
        base_url="http://localhost:8005",
        health_endpoint="/health"
    )
}

def get_system_info() -> Dict[str, Any]:
    """Get system information"""
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "architecture": platform.machine(),
        "processor": platform.processor(),
        "cpu_count": psutil.cpu_count(),
        "memory_total": psutil.virtual_memory().total,
        "memory_available": psutil.virtual_memory().available,
        "disk_usage": psutil.disk_usage('/').percent
    }

async def check_service(service_name: str, url: str) -> ServiceHealth:
    """Check a single service health"""
    try:
        start_time = time.time()
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=5) as response:
                response_time = time.time() - start_time
                if response.status == 200:
                    return ServiceHealth(
                        service_name=service_name,
                        status="healthy",
                        response_time=response_time,
                        last_check=time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    )
                else:
                    return ServiceHealth(
                        service_name=service_name,
                        status="unhealthy",
                        response_time=response_time,
                        last_check=time.strftime("%Y-%m-%dT%H:%M:%SZ")
                    )
    except Exception as e:
        return ServiceHealth(
            service_name=service_name,
            status="unreachable",
            response_time=0.0,
            last_check=time.strftime("%Y-%m-%dT%H:%M:%SZ")
        )

async def check_all_services() -> Dict[str, ServiceHealth]:
    """Check all registered services"""
    tasks = [check_service(name, service.base_url + service.health_endpoint) 
             for name, service in registered_services.items()]
    service_healths = await asyncio.gather(*tasks)
    
    results = {}
    for health in service_healths:
        results[health.service_name] = health
    
    return results

def get_registered_services() -> List[ServiceRegistry]:
    """Get all registered services"""
    return list(registered_services.values())

def get_service(service_name: str) -> ServiceRegistry:
    """Get a specific service"""
    return registered_services.get(service_name)
