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


def create_new_device_with_configuration(device_data: Dict) -> tuple[str, str]:
    """
    新規デバイスを登録し、WiFi設定を適用
    Returns: (device_id, status_message)
    """
    device_id = str(uuid.uuid4())
    current_time = datetime.now().isoformat()
    
    # 最初は"configuring"状態で作成
    initial_status = "configuring"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO devices (id, mac_address, channel, key, date, name, ssid, status, password, room, desc, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            device_id,
            device_data.get('mac_address'),
            device_data.get('channel'),
            device_data.get('key'),
            current_time,
            device_data.get('name'),
            device_data.get('ssid'),
            initial_status,
            device_data.get('password'),
            device_data.get('room'),
            device_data.get('desc'),
            current_time,
            current_time
        ))
        
        # DPP設定の適用（シミュレーション）
        configuration_success = apply_dpp_configuration(device_data)
        
        if configuration_success:
            # 設定成功時は"configured"に更新
            cursor.execute('''
                UPDATE devices SET status = ?, updated_at = ? WHERE id = ?
            ''', ("configured", datetime.now().isoformat(), device_id))
            status_message = "デバイスの設定が正常に完了しました"
        else:
            # 設定失敗時は"error"に更新
            cursor.execute('''
                UPDATE devices SET status = ?, updated_at = ? WHERE id = ?
            ''', ("error", datetime.now().isoformat(), device_id))
            status_message = "デバイス設定の適用に失敗しました"
        
        conn.commit()
        return device_id, status_message
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def apply_dpp_configuration(device_data: Dict) -> bool:
    """
    DPP設定を適用する（現在はシミュレーション）
    実際の実装では、hostapdやwpa_supplicantを使用してDPP設定を適用
    """
    import time
    import random
    
    # 設定適用のシミュレーション（1-3秒のランダムな遅延）
    time.sleep(random.uniform(1, 3))
    
    # 90%の確率で成功をシミュレート
    return random.random() > 0.1


def get_device_by_id(device_id: str) -> Optional[Dict]:
    """IDでデバイスを取得"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, mac_address, channel, key, date, name, ssid, status, password, room, desc
        FROM devices
        WHERE id = ?
    ''', (device_id,))
    device = cursor.fetchone()
    conn.close()
    
    return dict(device) if device else None


def update_device(device_id: str, update_data: Dict) -> bool:
    """デバイス情報を更新"""
    current_time = datetime.now().isoformat()
    
    # 更新可能なフィールドのリスト
    allowed_fields = ['name', 'ssid', 'password', 'room', 'desc', 'status']
    
    # 更新するフィールドを抽出
    update_fields = {}
    for field, value in update_data.items():
        if field in allowed_fields and value is not None:
            update_fields[field] = value
    
    if not update_fields:
        return False
    
    # SQL文を動的に構築
    set_clause = ', '.join([f"{field} = ?" for field in update_fields.keys()])
    set_clause += ', updated_at = ?'
    
    values = list(update_fields.values()) + [current_time, device_id]
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute(f'''
            UPDATE devices 
            SET {set_clause}
            WHERE id = ?
        ''', values)
        
        rows_affected = cursor.rowcount
        conn.commit()
        
        return rows_affected > 0
        
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()