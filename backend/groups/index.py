import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление учебными группами
    Args: event - dict с httpMethod, body (name, description, deadline)
    Returns: HTTP response со списком групп или созданной группой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            cursor.execute("""
                SELECT g.*, u.full_name as admin_name,
                       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as member_count
                FROM groups g
                LEFT JOIN users u ON g.admin_id = u.id
                ORDER BY g.created_at DESC
            """)
            groups = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'groups': [dict(g) for g in groups]
                }, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name')
            description = body_data.get('description', '')
            admin_id = body_data.get('admin_id')
            deadline = body_data.get('deadline')
            
            cursor.execute(
                "INSERT INTO groups (name, description, admin_id, deadline) VALUES (%s, %s, %s, %s) RETURNING *",
                (name, description, admin_id, deadline)
            )
            group = cursor.fetchone()
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
                    'group': dict(group)
                }, default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'join':
                group_id = body_data.get('group_id')
                user_id = body_data.get('user_id')
                
                cursor.execute(
                    "INSERT INTO group_members (group_id, user_id) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING *",
                    (group_id, user_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
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
