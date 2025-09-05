from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from .models import ServiceRegistry, Workflow, WorkflowCreate, WorkflowStatusResponse
from .services import (
    get_services, get_service, create_workflow, get_workflows, 
    get_workflow, delete_workflow, execute_workflow, get_workflow_status
)

router = APIRouter()

@router.get("/services", response_model=List[ServiceRegistry])
async def get_services_endpoint():
    """Get all registered services"""
    return get_services()

@router.get("/services/{service_name}", response_model=ServiceRegistry)
async def get_service_endpoint(service_name: str):
    """Get a specific service"""
    service = get_service(service_name)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.post("/workflows", response_model=Workflow)
async def create_workflow_endpoint(workflow_data: WorkflowCreate):
    """Create a new workflow"""
    workflow_dict = workflow_data.dict()
    return create_workflow(workflow_dict)

@router.get("/workflows", response_model=List[Workflow])
async def get_workflows_endpoint():
    """Get all workflows"""
    return get_workflows()

@router.get("/workflows/{workflow_id}", response_model=Workflow)
async def get_workflow_endpoint(workflow_id: str):
    """Get a specific workflow"""
    workflow = get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow

@router.post("/workflows/{workflow_id}/execute", response_model=Workflow)
async def execute_workflow_endpoint(workflow_id: str):
    """Execute a workflow"""
    try:
        return await execute_workflow(workflow_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/workflows/{workflow_id}")
async def delete_workflow_endpoint(workflow_id: str):
    """Delete a workflow"""
    if not delete_workflow(workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": "Workflow deleted successfully"}

@router.get("/workflows/{workflow_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status_endpoint(workflow_id: str):
    """Get workflow status"""
    status = get_workflow_status(workflow_id)
    if not status:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return WorkflowStatusResponse(**status)
