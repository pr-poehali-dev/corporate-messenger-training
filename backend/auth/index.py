import json
import os
import hashlib
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Аутентификация пользователей и регистрация
    Args: event - dict с httpMethod, body (email, password, full_name, role)
    Returns: HTTP response с токеном или ошибкой
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
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'login')
            
            if action == 'register':
                email = body_data.get('email')
                password = body_data.get('password')
                full_name = body_data.get('full_name')
                role = body_data.get('role', 'student')
                
                cursor.execute(
                    "SELECT id FROM users WHERE email = %s",
                    (email,)
                )
                existing_user = cursor.fetchone()
                
                if existing_user:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': False,
                            'error': 'Email already registered'
                        })
                    }
                
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cursor.execute(
                    "INSERT INTO users (email, password_hash, full_name, role) VALUES (%s, %s, %s, %s) RETURNING id, email, full_name, role",
                    (email, password_hash, full_name, role)
                )
                user = cursor.fetchone()
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
                        'user': dict(user)
                    })
                }
            
            elif action == 'login':
                email = body_data.get('email')
                password = body_data.get('password')
                password_hash = hashlib.sha256(password.encode()).hexdigest()
                
                cursor.execute(
                    "SELECT id, email, full_name, role FROM users WHERE email = %s AND password_hash = %s",
                    (email, password_hash)
                )
                user = cursor.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': True,
                            'user': dict(user)
                        })
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'success': False,
                            'error': 'Invalid credentials'
                        })
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