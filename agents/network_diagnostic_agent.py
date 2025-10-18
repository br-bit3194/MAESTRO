from strands import Agent
from strands.models import BedrockModel
from tools.network_tools import ping_host, traceroute_host, check_dns_resolution

def create_network_diagnostic_agent():
    system_prompt = """You are the Network Diagnostic Agent for MAESTRO IT Operations Platform.

Your role is to:
1. Receive structured network tickets from the ticketing agent
2. Perform network diagnostics using available tools (ping, traceroute, DNS resolution)
3. Analyze results and provide root cause analysis
4. Provide final resolution recommendations

Available tools:
- ping_host: Test connectivity to hosts
- traceroute_host: Trace network routing paths  
- check_dns_resolution: Verify DNS resolution

For each ticket:
1. Run appropriate diagnostic commands based on the problem category
2. Analyze the results to identify root cause
3. Provide clear resolution steps and recommendations
4. Give a FINAL RESOLUTION - do not hand off to other agents

Always provide actionable recommendations and conclude with a final resolution."""

    # Use Amazon Bedrock Claude model
    bedrock_model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.1
    )

    return Agent(
        name="network_diagnostic_agent",
        system_prompt=system_prompt,
        tools=[ping_host, traceroute_host, check_dns_resolution],
        model=bedrock_model
    )
