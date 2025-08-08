import sqlite3
import uuid
from datetime import datetime
from typing import Dict, List, Optional

DATABASE_FILE = "devices.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS devices (
            id TEXT PRIMARY KEY,
            mac_address TEXT NOT NULL,
            channel TEXT NOT NULL,
            key TEXT NOT NULL,
            date TEXT DEFAULT CURRENT_TIMESTAMP,
            name TEXT,
            ssid TEXT,
            status TEXT DEFAULT 'scanned',
            password TEXT,
            room TEXT,
            desc TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_all_devices() -> List[Dict]:
    """全てのデバイスを取得"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, mac_address, channel, key, date, name, ssid, status, password, room, desc
        FROM devices
        ORDER BY created_at DESC
    ''')
    devices = cursor.fetchall()
    conn.close()
    
    # Row オブジェクトを辞書に変換
    return [dict(device) for device in devices]

def create_device(device_data: Dict) -> str:
    """新しいデバイスを作成"""
    device_id = str(uuid.uuid4())
    current_time = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO devices (id, mac_address, channel, key, date, name, ssid, status, password, room, desc, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        device_id,
        device_data.get('mac_address'),
        device_data.get('channel'),
        device_data.get('key'),
        device_data.get('date', current_time),
        device_data.get('name'),
        device_data.get('ssid'),
        device_data.get('status', 'scanned'),
        device_data.get('password'),
        device_data.get('room'),
        device_data.get('desc'),
        current_time,
        current_time
    ))
    conn.commit()
    conn.close()
    
    return device_id
