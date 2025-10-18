from strands import Agent
from strands.models import BedrockModel
from tools.cloud_tools import list_all_buckets, get_bucket_location, check_bucket_exists

def create_cloud_service_agent():
    """Generic cloud service agent for AWS operations"""
    
    system_prompt = """You are a cloud service agent specializing in AWS operations.

Your role is to:
1. Analyze cloud service related tickets (especially AWS S3 issues)
2. Use AWS diagnostic tools to investigate problems
3. Provide clear resolution steps and recommendations
4. ALWAYS hand back to orchestrator_agent after providing resolution

Available tools:
- list_all_buckets: List all S3 buckets in the account
- get_bucket_location: Get the region of a specific bucket
- check_bucket_exists: Check if a bucket exists and is accessible

For S3 bucket issues:
1. First check if the bucket exists using check_bucket_exists
2. If not found, list all buckets to see what's available
3. If found but not accessible, check permissions
4. Provide specific resolution steps
5. CRITICAL: Hand off to orchestrator_agent with complete resolution

Never end without handing back to orchestrator_agent."""

    # Use Amazon Bedrock Claude model
    bedrock_model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.2
    )

    return Agent(
        name="cloud_service_agent",
        system_prompt=system_prompt,
        model=bedrock_model,
        tools=[list_all_buckets, get_bucket_location, check_bucket_exists]
    )
