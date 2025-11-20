from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union, Annotated
import uvicorn
import json
from datetime import datetime, timezone
import os
from pathlib import Path
import uuid
import shutil
import asyncio

from maestro_swarm import run_maestro_workflow, create_maestro_swarm
from dynamodb_utils import db_manager
from image_utils import process_uploaded_images, analyze_image, cleanup_temp_files
from multimodal_input import process_multimodal_input

app = FastAPI(title="MAESTRO API", version="1.0.0")

maestro_agent = create_maestro_swarm()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure necessary directories exist
os.makedirs("memories", exist_ok=True)
os.makedirs("uploads", exist_ok=True)

# Path for memory file
MEMORY_FILE = "memories/maestro_memories.json"
os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)

# Mount static files for serving uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

class TicketBase(BaseModel):
    description: str
    priority: str = "Medium"
    timestamp: Optional[str] = None
    attachments: Optional[List[Dict[str, str]]] = []

class TicketCreate(TicketBase):
    title: Optional[str] = None
    description: str
    priority: str = "Medium"
    category: str = "other"
    attachments: List[Dict[str, str]] = []

class Ticket(TicketBase):
    ticket_id: str = Field(..., alias="id")  # Maps id to ticket_id for API responses
    status: str = "Open"
    created_at: str
    resolved_at: Optional[str] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True  # Allow both id and ticket_id in input data

@app.get("/health")
async def health_check():
    """Health check endpoint to verify backend status"""
    try:
        # Try to check if AWS credentials are configured
        import boto3
        from botocore.exceptions import NoCredentialsError, ClientError
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "services": {
                "api": "operational",
                "dynamodb": "unknown",
                "bedrock": "unknown"
            }
        }
        
        # Check DynamoDB connectivity
        try:
            sts = boto3.client('sts')
            sts.get_caller_identity()
            health_status["services"]["dynamodb"] = "operational"
            health_status["services"]["bedrock"] = "operational"
        except NoCredentialsError:
            health_status["services"]["dynamodb"] = "no_credentials"
            health_status["services"]["bedrock"] = "no_credentials"
            health_status["status"] = "degraded"
            health_status["message"] = "AWS credentials not configured. Please run 'aws configure'"
        except ClientError as e:
            health_status["services"]["dynamodb"] = "error"
            health_status["services"]["bedrock"] = "error"
            health_status["status"] = "degraded"
            health_status["message"] = f"AWS authentication error: {str(e)}"
        except Exception as e:
            health_status["services"]["dynamodb"] = "error"
            health_status["services"]["bedrock"] = "error"
            health_status["status"] = "degraded"
            health_status["message"] = f"AWS service check failed: {str(e)}"
        
        return health_status
    except Exception as e:
        return {
            "status": "unhealthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e)
        }

@app.post("/api/tickets", response_model=Ticket)
async def create_ticket(ticket: TicketCreate):
    """Create a new ticket in DynamoDB"""
    ticket_id = f"TKT-{str(uuid.uuid4())}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_ticket = {
        'ticket_id': ticket_id,
        'title': getattr(ticket, 'title', 'No Title'),
        'description': ticket.description,
        'original_description': getattr(ticket, 'original_description', ticket.description),
        'priority': ticket.priority,
        'category': getattr(ticket, 'category', 'other'),
        'status': 'Open',
        'created_at': now,
        'updated_at': now,
        'timestamp': getattr(ticket, 'timestamp', now),
        'attachments': getattr(ticket, 'attachments', [])
    }
    
    # Save to DynamoDB
    try:
        db_manager.create_ticket(new_ticket)
        return Ticket(**new_ticket)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )

@app.get("/api/tickets", response_model=List[Ticket])
async def list_tickets():
    """List all tickets from DynamoDB"""
    try:
        tickets = db_manager.list_tickets()
        # Convert DynamoDB items to Ticket models
        return [Ticket(**ticket) for ticket in tickets]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tickets: {str(e)}"
        )

@app.get("/api/tickets/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Get a specific ticket by ID from DynamoDB"""
    ticket = db_manager.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return Ticket(**ticket)

@app.post("/api/process-ticket/{ticket_id}")
async def process_ticket(ticket_id: str):
    """Process a ticket using the MAESTRO workflow"""
    # Get the ticket from DynamoDB
    ticket = db_manager.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    try:
        # Get the raw result from the maestro agent
        raw_result = maestro_agent(ticket["description"])
        
        # Log the raw result structure for debugging
        print("\n" + "="*60)
        print("🔍 BACKEND - Raw Result from MAESTRO Agent")
        print("="*60)
        print(f"Result type: {type(raw_result)}")
        print(f"Has __dict__: {hasattr(raw_result, '__dict__')}")
        
        if hasattr(raw_result, '__dict__'):
            print(f"Attributes: {list(raw_result.__dict__.keys())}")
        
        # Convert SwarmResult to a serializable format
        # SwarmResult has attributes: status, results, accumulated_usage, accumulated_metrics, execution_count, execution_time, node_history
        if hasattr(raw_result, '__dict__'):
            # Extract all non-private, non-callable attributes
            result = {}
            for k, v in raw_result.__dict__.items():
                if not k.startswith('_') and not callable(v):
                    result[k] = v
                    print(f"  - {k}: {type(v)}")
        else:
            result = str(raw_result)
        
        # Serialize the result to ensure it's JSON-compatible
        # Use default=str to handle any non-serializable objects
        result_json = json.dumps(result, default=str)
        result_serialized = json.loads(result_json)
        
        print(f"\nSerialized result keys: {list(result_serialized.keys())}")
        if 'node_history' in result_serialized:
            print(f"Node history length: {len(result_serialized.get('node_history', []))}")
        if 'results' in result_serialized:
            print(f"Results agents: {list(result_serialized.get('results', {}).keys())}")
        print("="*60 + "\n")
            
        # Update ticket status in DynamoDB
        update_data = {
            'status': 'Processed',
            'processed_at': datetime.now(timezone.utc).isoformat(),
            'result': result_serialized
        }
        updated_ticket = db_manager.update_ticket(ticket_id, update_data)
        
        if not updated_ticket:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update ticket status"
            )
            
        return {
            "status": "success",
            "ticket_id": ticket_id,
            "result": result_serialized
        }

    except Exception as e:
        # Update ticket status to Error in DynamoDB
        if ticket:
            db_manager.update_ticket(ticket_id, {
                'status': 'Error',
                'error': str(e),
                'processed_at': datetime.now(timezone.utc).isoformat()
            })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing ticket: {str(e)}"
        )

def save_to_memory(ticket: dict):
    """Save resolution to memory file"""
    try:
        memory_entry = {
            "query": ticket["description"],
            "resolution": f"Ticket {ticket['ticket_id']} resolved",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ticket_id": ticket["ticket_id"],
            "priority": ticket.get("priority", "Medium")
        }
        
        # Load existing memories
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, 'r') as f:
                memories = json.load(f)
        else:
            memories = []
        
        # Add new memory
        memories.append(memory_entry)
        
        # Save back to file
        with open(MEMORY_FILE, 'w') as f:
            json.dump(memories, f, indent=2)
            
    except Exception as e:
        print(f"Error saving to memory: {e}")

async def save_uploaded_file(file: UploadFile) -> Dict[str, Any]:
    """Save an uploaded file and return its metadata"""
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1] if file.filename else '.bin'
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join("uploads", file_name)
    
    try:
        # Save file in binary mode
        with open(file_path, "wb") as buffer:
            # Read file in chunks to handle large files
            while content := await file.read(1024 * 1024):  # 1MB chunks
                buffer.write(content)
        
        return {
            "filename": file.filename or "unnamed_file",
            "file_path": f"/uploads/{file_name}",
            "saved_path": file_path,
            "content_type": file.content_type or "application/octet-stream",
            "size": os.path.getsize(file_path)
        }
    except Exception as e:
        # Clean up if there was an error
        if os.path.exists(file_path):
            try:
                os.unlink(file_path)
            except:
                pass
        raise e

async def process_ticket_async(ticket_id: str, ticket_data: Dict[str, Any]):
    """Process ticket asynchronously in the background"""
    try:
        # Update ticket status to processing
        db_manager.update_ticket(ticket_id, {'status': 'Processing'})
        
        # Here you can add more processing logic if needed
        # For now, we'll just mark it as completed after a short delay
        await asyncio.sleep(2)
        
        db_manager.update_ticket(ticket_id, {
            'status': 'Processed',
            'processed_at': datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        print(f"Error in background processing for ticket {ticket_id}: {str(e)}")
        db_manager.update_ticket(ticket_id, {
            'status': 'Error',
            'error': str(e)
        })

@app.post("/api/submit-ticket")
async def submit_ticket(
    title: str = Form(...),
    description: str = Form(...),
    priority: str = Form("medium"),
    category: str = Form("other"),
    files: List[UploadFile] = File([]),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """
    Submit a new ticket with form data and optional file attachments.
    Processes the input using multimodal analysis if files are provided.
    
    Args:
        title: Title of the ticket
        description: Detailed description of the issue
        priority: Priority level (low, medium, high, critical)
        category: Category of the issue (network, storage, compute, security, other)
        files: Optional list of uploaded files
        
    Returns:
        Dictionary containing the created ticket data, status, and analysis results
    """
    try:
        # Process file uploads if any
        processed_files = []
        image_paths = []
        
        if files:
            for file in files:
                try:
                    file_meta = await save_uploaded_file(file)
                    processed_files.append(file_meta)
                except Exception as e:
                    print(f"Error saving file {file.filename}: {str(e)}")
                    continue
        
        # Generate a unique ticket ID
        ticket_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        
        # Process with multimodal input if files are provided
        processed_description = description
        try:
            if processed_files:
                # Pass both text and image paths to multimodal processing
                image_paths = [f['saved_path'] for f in processed_files if f.get('saved_path')]
                if image_paths:  # Only process if we have valid image paths
                    processed_description = await process_multimodal_input(description, image_paths)
        except Exception as e:
            print(f"Error in multimodal processing: {str(e)}")
            # Fall back to original description if processing fails

        # Create ticket data with required ticket_id and timestamps
        ticket_data = {
            'ticket_id': ticket_id,  # Add the ticket_id here
            'title': title,
            'description': processed_description,
            'original_description': description,  # Save original user input
            'priority': priority,
            'category': category,
            'status': 'Open',
            'created_at': created_at,
            'updated_at': created_at,  # Add updated_at timestamp
            'attachments': [{
                'filename': f['filename'],
                'content_type': f['content_type'],
                'size': f['size'],
                'file_path': f['file_path']
            } for f in processed_files]
        }

        # Save to database
        ticket = db_manager.create_ticket(ticket_data)
        
        # Trigger background processing if needed
        if processed_files:
            background_tasks.add_task(process_ticket_async, ticket['ticket_id'], ticket_data)

        return {
            "status": "success",
            "message": "Ticket submitted successfully",
            "ticket_id": ticket['ticket_id'],
            "data": ticket
        }

    except Exception as e:
        # Clean up any uploaded files if there was an error
        if 'processed_files' in locals():
            for file_meta in processed_files:
                if 'saved_path' in file_meta and os.path.exists(file_meta['saved_path']):
                    try:
                        os.unlink(file_meta['saved_path'])
                    except:
                        pass
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error submitting ticket: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
