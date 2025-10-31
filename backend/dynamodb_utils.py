import boto3
import os
from typing import Dict, Any, Optional, List
from boto3.dynamodb.conditions import Key
import json

class DynamoDBManager:
    def __init__(self, table_name: str = 'MaestroTickets'):
        """
        Initialize DynamoDB client and resource.
        If running locally, ensure AWS credentials are configured in ~/.aws/credentials
        or via environment variables:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_DEFAULT_REGION (e.g., 'us-east-1')
        """
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(table_name)
        
    def create_ticket(self, ticket_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new ticket in DynamoDB"""
        try:
            # Ensure all values are JSON serializable
            serialized_data = json.loads(json.dumps(ticket_data, default=str))
            self.table.put_item(Item=serialized_data)
            return ticket_data
        except Exception as e:
            print(f"Error creating ticket: {str(e)}")
            raise
    
    def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a ticket by ID"""
        try:
            response = self.table.get_item(Key={'ticket_id': ticket_id})
            return response.get('Item')
        except Exception as e:
            print(f"Error getting ticket {ticket_id}: {str(e)}")
            return None
    
    def list_tickets(self) -> List[Dict[str, Any]]:
        """List all tickets (be cautious with large tables)"""
        try:
            response = self.table.scan()
            return response.get('Items', [])
        except Exception as e:
            print(f"Error listing tickets: {str(e)}")
            return []
    
    def update_ticket(self, ticket_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update a ticket's attributes"""
        try:
            # Remove ticket_id from update_data if present to avoid overwriting the key
            update_data.pop('ticket_id', None)
            
            # Create update expression
            update_expression = 'SET ' + ', '.join(f'#{k} = :{k}' for k in update_data.keys())
            expression_attribute_names = {f'#{k}': k for k in update_data.keys()}
            expression_attribute_values = {f':{k}': v for k, v in update_data.items()}
            
            response = self.table.update_item(
                Key={'ticket_id': ticket_id},
                UpdateExpression=update_expression,
                ExpressionAttributeNames=expression_attribute_names,
                ExpressionAttributeValues=expression_attribute_values,
                ReturnValues='ALL_NEW'
            )
            return response.get('Attributes')
        except Exception as e:
            print(f"Error updating ticket {ticket_id}: {str(e)}")
            return None

# Create a global instance to be used across the application
db_manager = DynamoDBManager()
