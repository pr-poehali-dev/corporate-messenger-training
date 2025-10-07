import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление сообщениями в группах
    Args: event - dict с httpMethod, queryStringParameters (group_id), body (content, file_name)
    Returns: HTTP response со списком сообщений или созданным сообщением
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            group_id = params.get('group_id')
            
            if group_id:
                cursor.execute("""
                    SELECT m.*, u.full_name as user_name, u.role as user_role
                    FROM messages m
                    LEFT JOIN users u ON m.user_id = u.id
                    WHERE m.group_id = %s
                    ORDER BY m.created_at ASC
                """, (group_id,))
                messages = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'messages': [dict(m) for m in messages]
                    }, default=str)
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'group_id required'})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            group_id = body_data.get('group_id')
            user_id = body_data.get('user_id')
            content = body_data.get('content')
            file_name = body_data.get('file_name')
            file_url = body_data.get('file_url')
            
            cursor.execute(
                "INSERT INTO messages (group_id, user_id, content, file_name, file_url) VALUES (%s, %s, %s, %s, %s) RETURNING *",
                (group_id, user_id, content, file_name, file_url)
            )
            message = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'message': dict(message)
                }, default=str)
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cursor.close()
        conn.close()
