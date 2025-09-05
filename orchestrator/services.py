import time
import asyncio
import aiohttp
from typing import Dict, List, Optional
from .models import ServiceRegistry, Task, Workflow, WorkflowStatus, TaskStatus

# Service registry
service_registry = {
    "ticket": ServiceRegistry(
        service_name="ticket",
        base_url="http://localhost:8001",
        health_endpoint="/health"
    ),
    "healthcheck": ServiceRegistry(
        service_name="healthcheck",
        base_url="http://localhost:8002",
        health_endpoint="/health"
    ),
    "memory": ServiceRegistry(
        service_name="memory",
        base_url="http://localhost:8003",
        health_endpoint="/health"
    ),
    "sandbox": ServiceRegistry(
        service_name="sandbox",
        base_url="http://localhost:8005",
        health_endpoint="/health"
    )
}

# In-memory storage for workflows
workflows_db: Dict[str, Workflow] = {}
workflow_counter = 1

def get_services() -> List[ServiceRegistry]:
    """Get all registered services"""
    return list(service_registry.values())

def get_service(service_name: str) -> Optional[ServiceRegistry]:
    """Get a specific service"""
    return service_registry.get(service_name)

def create_workflow(workflow_data: dict) -> Workflow:
    """Create a new workflow"""
    global workflow_counter
    
    workflow_id = f"workflow_{workflow_counter}"
    workflow_counter += 1
    
    # Create tasks from the provided data
    tasks = []
    for i, task_data in enumerate(workflow_data.get("tasks", [])):
        task = Task(
            id=f"{workflow_id}_task_{i}",
            name=task_data.get("name", f"Task {i}"),
            service=task_data.get("service"),
            endpoint=task_data.get("endpoint"),
            method=task_data.get("method", "GET"),
            payload=task_data.get("payload"),
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")
        )
        tasks.append(task)
    
    workflow = Workflow(
        id=workflow_id,
        name=workflow_data.get("name"),
        description=workflow_data.get("description"),
        tasks=tasks,
        created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    
    workflows_db[workflow_id] = workflow
    return workflow

def get_workflows() -> List[Workflow]:
    """Get all workflows"""
    return list(workflows_db.values())

def get_workflow(workflow_id: str) -> Optional[Workflow]:
    """Get a specific workflow"""
    return workflows_db.get(workflow_id)

def delete_workflow(workflow_id: str) -> bool:
    """Delete a workflow"""
    if workflow_id in workflows_db:
        del workflows_db[workflow_id]
        return True
    return False

async def execute_task(task: Task) -> Dict[str, Any]:
    """Execute a single task by calling the appropriate service"""
    if task.service not in service_registry:
        raise Exception(f"Service {task.service} not found in registry")
    
    service = service_registry[task.service]
    url = f"{service.base_url}{task.endpoint}"
    
    async with aiohttp.ClientSession() as session:
        if task.method.upper() == "GET":
            async with session.get(url) as response:
                return await response.json()
        elif task.method.upper() == "POST":
            async with session.post(url, json=task.payload) as response:
                return await response.json()
        elif task.method.upper() == "PUT":
            async with session.put(url, json=task.payload) as response:
                return await response.json()
        elif task.method.upper() == "DELETE":
            async with session.delete(url) as response:
                return await response.json()
        else:
            raise Exception(f"Unsupported HTTP method: {task.method}")

async def execute_workflow(workflow_id: str) -> Workflow:
    """Execute a workflow"""
    workflow = get_workflow(workflow_id)
    if not workflow:
        raise Exception("Workflow not found")
    
    workflow.status = WorkflowStatus.RUNNING
    workflow.started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    try:
        # Execute tasks sequentially
        for task in workflow.tasks:
            task.status = TaskStatus.RUNNING
            task.started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
            
            try:
                # Execute the task
                result = await execute_task(task)
                task.result = result
                task.status = TaskStatus.COMPLETED
                task.completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
                
            except Exception as e:
                task.status = TaskStatus.FAILED
                task.error = str(e)
                task.completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
                # Continue with other tasks even if one fails
        
        # Check if all tasks completed successfully
        failed_tasks = [task for task in workflow.tasks if task.status == TaskStatus.FAILED]
        if failed_tasks:
            workflow.status = WorkflowStatus.FAILED
        else:
            workflow.status = WorkflowStatus.COMPLETED
        
        workflow.completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        workflow.result = {
            "total_tasks": len(workflow.tasks),
            "completed_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.COMPLETED]),
            "failed_tasks": len(failed_tasks)
        }
        
    except Exception as e:
        workflow.status = WorkflowStatus.FAILED
        workflow.completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        workflow.result = {"error": str(e)}
    
    return workflow

def get_workflow_status(workflow_id: str) -> Optional[Dict[str, Any]]:
    """Get workflow status information"""
    workflow = get_workflow(workflow_id)
    if not workflow:
        return None
    
    return {
        "workflow_id": workflow_id,
        "status": workflow.status,
        "total_tasks": len(workflow.tasks),
        "completed_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.COMPLETED]),
        "failed_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.FAILED]),
        "running_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.RUNNING]),
        "pending_tasks": len([t for t in workflow.tasks if t.status == TaskStatus.PENDING])
    }
