import boto3
from botocore.exceptions import ClientError
from strands.tools import tool

@tool
def list_all_buckets():
    """List all S3 buckets in the AWS account"""
    try:
        session = boto3.Session(profile_name='XXXXXXXXXX_AdministratorAccess')
        s3_client = session.client('s3')
        response = s3_client.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]
        return {'success': True, 'buckets': buckets, 'count': len(buckets)}
    except ClientError as e:
        return {'success': False, 'error': str(e)}

@tool
def get_bucket_location(bucket_name: str):
    """Get the region location of an S3 bucket"""
    try:
        session = boto3.Session(profile_name='XXXXXXXXXX_AdministratorAccess')
        s3_client = session.client('s3')
        response = s3_client.get_bucket_location(Bucket=bucket_name)
        region = response['LocationConstraint'] or 'us-east-1'
        return {'success': True, 'bucket': bucket_name, 'region': region}
    except ClientError as e:
        return {'success': False, 'error': str(e), 'bucket': bucket_name}

@tool
def check_bucket_exists(bucket_name: str):
    """Check if an S3 bucket exists and is accessible"""
    try:
        session = boto3.Session(profile_name='XXXXXXXXXX_AdministratorAccess')
        s3_client = session.client('s3')
        s3_client.head_bucket(Bucket=bucket_name)
        return {'success': True, 'bucket': bucket_name, 'exists': True}
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            return {'success': True, 'bucket': bucket_name, 'exists': False, 'reason': 'Bucket not found'}
        elif error_code == '403':
            return {'success': True, 'bucket': bucket_name, 'exists': True, 'accessible': False, 'reason': 'Access denied'}
        else:
            return {'success': False, 'error': str(e), 'bucket': bucket_name}
