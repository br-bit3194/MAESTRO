import time
import subprocess
import tempfile
import os
import asyncio
from typing import Dict, List, Optional
from .models import CodeExecution, Language, ExecutionStatus, SandboxEnvironment

# Sandbox environments
sandbox_environments = {
    "python": {
        "command": "python",
        "extension": ".py",
        "timeout": 30
    },
    "javascript": {
        "command": "node",
        "extension": ".js",
        "timeout": 30
    },
    "bash": {
        "command": "bash",
        "extension": ".sh",
        "timeout": 30
    }
}

# In-memory storage for executions
executions_db: Dict[str, CodeExecution] = {}
execution_counter = 1

def get_environments() -> List[SandboxEnvironment]:
    """Get available sandbox environments"""
    environments = []
    for lang, config in sandbox_environments.items():
        env = SandboxEnvironment(
            id=lang,
            name=f"{lang.title()} Sandbox",
            language=Language(lang),
            status="available",
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            last_used=time.strftime("%Y-%m-%dT%H:%M:%SZ")
        )
        environments.append(env)
    return environments

def create_execution(language: Language, code: str, input_data: Optional[str] = None, timeout: int = 30) -> CodeExecution:
    """Create a new code execution"""
    global execution_counter
    
    execution_id = f"exec_{execution_counter}"
    execution_counter += 1
    
    execution = CodeExecution(
        id=execution_id,
        language=language,
        code=code,
        input_data=input_data,
        timeout=timeout,
        created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ")
    )
    
    executions_db[execution_id] = execution
    return execution

def get_execution(execution_id: str) -> Optional[CodeExecution]:
    """Get a specific execution"""
    return executions_db.get(execution_id)

def get_executions(limit: int = 100) -> List[CodeExecution]:
    """Get all executions"""
    executions = list(executions_db.values())
    executions.sort(key=lambda x: x.created_at, reverse=True)
    return executions[:limit]

def delete_execution(execution_id: str) -> bool:
    """Delete an execution"""
    if execution_id in executions_db:
        del executions_db[execution_id]
        return True
    return False

def get_execution_stats() -> Dict[str, any]:
    """Get execution statistics"""
    total_executions = len(executions_db)
    completed_executions = len([e for e in executions_db.values() if e.status == ExecutionStatus.COMPLETED])
    failed_executions = len([e for e in executions_db.values() if e.status == ExecutionStatus.FAILED])
    running_executions = len([e for e in executions_db.values() if e.status == ExecutionStatus.RUNNING])
    
    return {
        "total_executions": total_executions,
        "completed_executions": completed_executions,
        "failed_executions": failed_executions,
        "running_executions": running_executions,
        "success_rate": (completed_executions / total_executions * 100) if total_executions > 0 else 0,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

async def execute_code_async(execution: CodeExecution):
    """Execute code in a sandboxed environment"""
    execution.status = ExecutionStatus.RUNNING
    execution.started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    start_time = time.time()
    
    try:
        if execution.language not in sandbox_environments:
            raise Exception(f"Unsupported language: {execution.language}")
        
        env_config = sandbox_environments[execution.language]
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix=env_config["extension"],
            delete=False
        ) as temp_file:
            temp_file.write(execution.code)
            temp_file_path = temp_file.name
        
        try:
            # Prepare input data
            input_data = execution.input_data.encode() if execution.input_data else None
            
            # Execute the code
            process = await asyncio.create_subprocess_exec(
                env_config["command"],
                temp_file_path,
                stdin=subprocess.PIPE if input_data else None,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=tempfile.gettempdir()
            )
            
            # Send input data if provided
            if input_data:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(input=input_data),
                    timeout=execution.timeout
                )
            else:
                stdout, stderr = await asyncio.wait_for(
                    process.communicate(),
                    timeout=execution.timeout
                )
            
            execution.output = stdout.decode('utf-8', errors='replace')
            if stderr:
                execution.error = stderr.decode('utf-8', errors='replace')
            
            execution.status = ExecutionStatus.COMPLETED
            
        except asyncio.TimeoutError:
            execution.status = ExecutionStatus.TIMEOUT
            execution.error = f"Execution timed out after {execution.timeout} seconds"
            
        except Exception as e:
            execution.status = ExecutionStatus.FAILED
            execution.error = str(e)
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except:
                pass
    
    except Exception as e:
        execution.status = ExecutionStatus.FAILED
        execution.error = str(e)
    
    finally:
        execution.completed_at = time.strftime("%Y-%m-%dT%H:%M:%SZ")
        execution.execution_time = time.time() - start_time
