import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление системой учета должников
    Args: event - dict с httpMethod, queryStringParameters (group_id), body (user_id, description)
    Returns: HTTP response со списком должников
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
            params = event.get('queryStringParameters', {}) or {}
            group_id = params.get('group_id')
            
            if group_id:
                cursor.execute("""
                    SELECT d.*, u.full_name as user_name, u.email as user_email
                    FROM debtors d
                    LEFT JOIN users u ON d.user_id = u.id
                    WHERE d.group_id = %s AND d.resolved = false
                    ORDER BY d.created_at DESC
                """, (group_id,))
                debtors = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'debtors': [dict(d) for d in debtors]
                    }, default=str)
                }
            
            cursor.execute("""
                SELECT d.*, u.full_name as user_name, g.name as group_name
                FROM debtors d
                LEFT JOIN users u ON d.user_id = u.id
                LEFT JOIN groups g ON d.group_id = g.id
                WHERE d.resolved = false
                ORDER BY d.created_at DESC
            """)
            all_debtors = cursor.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'debtors': [dict(d) for d in all_debtors]
                }, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            group_id = body_data.get('group_id')
            user_id = body_data.get('user_id')
            description = body_data.get('description')
            amount = body_data.get('amount', 0)
            
            cursor.execute(
                "INSERT INTO debtors (group_id, user_id, description, amount) VALUES (%s, %s, %s, %s) ON CONFLICT (group_id, user_id) DO UPDATE SET description = EXCLUDED.description, amount = EXCLUDED.amount RETURNING *",
                (group_id, user_id, description, amount)
            )
            debtor = cursor.fetchone()
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
                    'debtor': dict(debtor)
                }, default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            debtor_id = body_data.get('debtor_id')
            resolved = body_data.get('resolved', True)
            
            cursor.execute(
                "UPDATE debtors SET resolved = %s WHERE id = %s RETURNING *",
                (resolved, debtor_id)
            )
            debtor = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'debtor': dict(debtor) if debtor else None
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
