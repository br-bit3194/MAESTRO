import subprocess
import json
from strands import tool

@tool
def ping_host(hostname: str, count: int = 4) -> str:
    """Test network connectivity to a host using ping.
    
    Args:
        hostname: The hostname or IP address to ping
        count: Number of ping packets to send
    """
    try:
        result = subprocess.run(
            ["ping", "-c", str(count), hostname],
            capture_output=True,
            text=True,
            timeout=30
        )
        return f"Ping results for {hostname}:\n{result.stdout}\nReturn code: {result.returncode}"
    except Exception as e:
        return f"Ping failed: {str(e)}"

@tool
def traceroute_host(hostname: str) -> str:
    """Trace the network route to a host.
    
    Args:
        hostname: The hostname or IP address to trace
    """
    try:
        result = subprocess.run(
            ["traceroute", hostname],
            capture_output=True,
            text=True,
            timeout=600
        )
        return f"Traceroute results for {hostname}:\n{result.stdout}\nReturn code: {result.returncode}"
    except Exception as e:
        return f"Traceroute failed: {str(e)}"

@tool
def check_dns_resolution(hostname: str) -> str:
    """Check DNS resolution for a hostname.
    
    Args:
        hostname: The hostname to resolve
    """
    try:
        result = subprocess.run(
            ["nslookup", hostname],
            capture_output=True,
            text=True,
            timeout=15
        )
        return f"DNS resolution for {hostname}:\n{result.stdout}\nReturn code: {result.returncode}"
    except Exception as e:
        return f"DNS resolution failed: {str(e)}"
