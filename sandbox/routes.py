from fastapi import APIRouter, HTTPException
from typing import List
from .models import CodeExecution, CodeExecutionRequest, SandboxEnvironment, ExecutionOutput, ExecutionStats
from .executor import (
    get_environments, create_execution, get_execution, get_executions, 
    delete_execution, execute_code_async, get_execution_stats
)
import asyncio

router = APIRouter()

@router.get("/environments", response_model=List[SandboxEnvironment])
async def get_environments_endpoint():
    """Get available sandbox environments"""
    return get_environments()

@router.post("/execute", response_model=CodeExecution)
async def execute_code(request: CodeExecutionRequest):
    """Execute code asynchronously"""
    execution = create_execution(
        language=request.language,
        code=request.code,
        input_data=request.input_data,
        timeout=request.timeout
    )
    
    # Execute the code asynchronously
    asyncio.create_task(execute_code_async(execution))
    
    return execution

@router.post("/execute/sync", response_model=CodeExecution)
async def execute_code_sync(request: CodeExecutionRequest):
    """Execute code synchronously"""
    execution = create_execution(
        language=request.language,
        code=request.code,
        input_data=request.input_data,
        timeout=request.timeout
    )
    
    # Execute immediately
    await execute_code_async(execution)
    
    return execution

@router.get("/executions", response_model=List[CodeExecution])
async def get_executions_endpoint(limit: int = 100):
    """Get all executions"""
    return get_executions(limit)

@router.get("/executions/{execution_id}", response_model=CodeExecution)
async def get_execution_endpoint(execution_id: str):
    """Get a specific execution"""
    execution = get_execution(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution

@router.delete("/executions/{execution_id}")
async def delete_execution_endpoint(execution_id: str):
    """Delete an execution"""
    if not delete_execution(execution_id):
        raise HTTPException(status_code=404, detail="Execution not found")
    return {"message": "Execution deleted successfully"}

@router.get("/executions/{execution_id}/output", response_model=ExecutionOutput)
async def get_execution_output(execution_id: str):
    """Get execution output"""
    execution = get_execution(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return ExecutionOutput(
        execution_id=execution_id,
        status=execution.status,
        output=execution.output,
        error=execution.error,
        execution_time=execution.execution_time
    )

@router.get("/stats", response_model=ExecutionStats)
async def get_stats():
    """Get execution statistics"""
    stats = get_execution_stats()
    return ExecutionStats(**stats)
