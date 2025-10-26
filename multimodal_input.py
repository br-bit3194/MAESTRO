from typing import List, Optional, Tuple
from strands import Agent
from strands.models import BedrockModel
from strands_tools import image_reader
import streamlit as st

def create_image_analysis_agent():
    """Create agent with image_reader tool for analyzing error screenshots."""
    return Agent(
        name="image_analysis_agent",
        tools=[image_reader],
        system_prompt="""Analyze screenshots to extract IT error information.

Extract and format as structured analysis:
- **Problem Description**: Brief summary of the issue
- **Error Details**: Exact error messages, codes, or alerts visible
- **Affected System/Service**: What system or application is affected
- **Severity Assessment**: Critical/High/Medium/Low based on error type
- **Technical Context**: Additional technical details visible
- **Recommended Actions**: Initial troubleshooting suggestions

Be thorough and extract all visible technical information.""",
        model=BedrockModel(
            model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
            temperature=0.1
        )
    )

def process_multimodal_input(text_input: str = "", image_paths: List[str] = None) -> str:
    """Process combined text and image inputs into unified ticket."""
    parts = []
    
    if text_input.strip():
        parts.append(f"**Text Description:**\n{text_input}")
        
    if image_paths:
        agent = create_image_analysis_agent()
        image_analyses = []
        
        for i, path in enumerate(image_paths, 1):
            try:
                result = agent(f"Analyze this error screenshot for IT troubleshooting: {path}")
                analysis_text = str(result)
                parts.append(f"**Image Analysis {i}:**\n{analysis_text}")
                
                # Store in session state if available (for Streamlit)
                if 'st' in globals() and hasattr(st, 'session_state'):
                    if 'last_ticket_images' in st.session_state:
                        if i-1 < len(st.session_state['last_ticket_images']):
                            # Update the analysis for this image
                            image_name = st.session_state['last_ticket_images'][i-1][0]
                            st.session_state['last_ticket_images'][i-1] = (image_name, analysis_text)
                
            except Exception as e:
                error_msg = f"Error processing image: {str(e)}"
                parts.append(f"**Image {i} Processing Error:**\n{error_msg}")
                
                # Store error in session state if available
                if 'st' in globals() and hasattr(st, 'session_state'):
                    if 'last_ticket_images' in st.session_state:
                        if i-1 < len(st.session_state['last_ticket_images']):
                            image_name = st.session_state['last_ticket_images'][i-1][0]
                            st.session_state['last_ticket_images'][i-1] = (image_name, error_msg)
    
    if not parts:
        raise ValueError("No input provided")
        
    return "\n\n".join(parts)
