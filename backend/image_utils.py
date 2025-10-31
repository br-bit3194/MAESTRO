import os
import tempfile
from typing import List, Dict, Any, Optional
from fastapi import UploadFile
import shutil

async def process_uploaded_images(files: List[UploadFile]) -> List[Dict[str, Any]]:
    """
    Process uploaded images and return their metadata and paths.
    
    Args:
        files: List of uploaded files
        
    Returns:
        List of dictionaries containing file metadata and paths
    """
    processed_files = []
    
    for file in files:
        if not file.filename:
            continue
            
        try:
            # Create a temporary file to save the uploaded file
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
                # Copy the uploaded file to the temporary file
                shutil.copyfileobj(file.file, tmp_file)
                tmp_path = tmp_file.name
            
            # Get file metadata
            file_metadata = {
                'filename': file.filename,
                'content_type': file.content_type,
                'size': os.path.getsize(tmp_path),
                'temp_path': tmp_path,
                'saved_path': None
            }
            
            processed_files.append(file_metadata)
            
        except Exception as e:
            print(f"Error processing file {file.filename}: {str(e)}")
            
    return processed_files

async def analyze_image(image_path: str) -> Dict[str, Any]:
    """
    Analyze an image and return analysis results.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dictionary containing analysis results
    """
    # TODO: Implement actual image analysis logic
    # This is a placeholder that simulates image analysis
    import random
    
    analysis_results = {
        'file_path': image_path,
        'analysis': {
            'objects_detected': random.randint(1, 5),
            'confidence': round(random.uniform(0.7, 0.99), 2),
            'tags': ['error', 'screenshot', 'ui'] if random.random() > 0.5 else ['screenshot', 'log']
        },
        'summary': 'This appears to be a system error screenshot' if 'error' in image_path.lower() else 'Screenshot analysis complete'
    }
    
    return analysis_results

async def cleanup_temp_files(processed_files: List[Dict[str, Any]]) -> None:
    """
    Clean up temporary files created during processing.
    
    Args:
        processed_files: List of processed file metadata
    """
    for file_meta in processed_files:
        if 'temp_path' in file_meta and os.path.exists(file_meta['temp_path']):
            try:
                os.unlink(file_meta['temp_path'])
            except Exception as e:
                print(f"Error cleaning up file {file_meta['temp_path']}: {str(e)}")
