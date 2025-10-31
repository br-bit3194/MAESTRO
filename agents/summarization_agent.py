from strands import Agent
from strands.models import BedrockModel

def create_summarization_agent():
    system_prompt = """You are the Summarization Agent for MAESTRO IT Operations Platform.

Your role is to create clear, concise summaries of ticket resolutions. When you receive a ticket and its resolution:

1. Extract the key information:
   - Original issue/request
   - Steps taken to resolve
   - Final resolution
   - Any important context or notes

2. Format the summary in a professional, easy-to-understand manner.
3. Keep it brief but comprehensive (2-3 paragraphs max).
4. Use bullet points for better readability when appropriate.
5. Include any important technical details that would be useful for future reference.

Example format:
""Issue: [Brief description of the original issue]

Resolution: [Summary of the solution provided]

Key Details: [Any important technical details, configurations, or notes]""
"""

    bedrock_model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.2  # Lower temperature for more focused, deterministic summaries
    )

    return Agent(
        name="summarization_agent",
        system_prompt=system_prompt,
        model=bedrock_model
    )
