from fastapi import APIRouter, HTTPException
from typing import Dict, List
from .models import HealthStatus, ServiceHealth, ServiceRegistry
from .services import get_system_info, check_all_services, get_registered_services, get_service, check_service
import time

router = APIRouter()

@router.get("/", response_model=HealthStatus)
async def health_check():
    """Get system health status"""
    uptime = time.time() - time.time()  # This would be actual uptime in production
    system_info = get_system_info()
    
    return HealthStatus(
        status="healthy",
        timestamp=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        uptime=uptime,
        system_info=system_info
    )

@router.get("/services", response_model=Dict[str, ServiceHealth])
async def check_all_services_endpoint():
    """Check all services health"""
    return await check_all_services()

@router.get("/services/{service_name}", response_model=ServiceHealth)
async def check_service_endpoint(service_name: str):
    """Check a specific service health"""
    service = get_service(service_name)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    return await check_service(service_name, service.base_url + service.health_endpoint)

@router.get("/registry", response_model=List[ServiceRegistry])
async def get_services_registry():
    """Get all registered services"""
    return get_registered_services()

@router.get("/registry/{service_name}", response_model=ServiceRegistry)
async def get_service_registry(service_name: str):
    """Get a specific service from registry"""
    service = get_service(service_name)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service
