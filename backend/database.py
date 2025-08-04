import sqlite3
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
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mac_address TEXT UNIQUE NOT NULL,
            channel TEXT NOT NULL,
            key TEXT NOT NULL,
            status TEXT DEFAULT 'scanned',
            ssid TEXT,
            password TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            configured_at TEXT
        )
    ''')
    conn.commit()
    conn.close()
