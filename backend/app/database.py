import sqlite3
import logging
from datetime import datetime
from typing import Dict, List, Optional

DATABASE_FILE = "devices.db"

# ログ設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def create_device(device_data: Dict) -> int:
    """新しいデバイスを作成"""
    current_time = datetime.now().isoformat()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO devices (mac_address, channel, key, date, name, ssid, status, password, room, desc, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
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
    device_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return device_id


def create_new_device_with_configuration(device_data: Dict) -> tuple[int, str]:
    """
    新規デバイスを登録し、WiFi設定を適用
    Returns: (device_id, status_message)
    """
    current_time = datetime.now().isoformat()
    
    # 最初は"configuring"状態で作成
    initial_status = "configuring"
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO devices (mac_address, channel, key, date, name, ssid, status, password, room, desc, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
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
        
        device_id = cursor.lastrowid
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
    DPP設定を適用する
    CLIディレクトリのスクリプトを使用してhostapdにDPP設定を適用
    """
    import subprocess
    import json
    import os
    from .config import settings
    
    logger.info(f"DPP設定適用開始: デバイス {device_data.get('mac_address')}")
    
    try:
        wifi_config = {
            "wi-fi_tech": "infra",
            "discovery": {
                "ssid": device_data.get('ssid', '')
            },
            "cred": {
                "akm": "psk",
                "pass": device_data.get('password', '')
            }
        }
        
        # JSON文字列を準備
        conf_json = json.dumps(wifi_config)
        logger.info(f"WiFi設定: SSID={wifi_config['discovery']['ssid']}")
        
        # CLIスクリプトパスの存在確認
        if not os.path.exists(settings.cli_script_path):
            logger.error(f"CLIスクリプトパスが見つかりません: {settings.cli_script_path}")
            return False
        
        # DPPプロビジョニングの実行
        success = _execute_dpp_provisioning(device_data, conf_json)
        
        if success:
            logger.info(f"DPP設定適用成功: デバイス {device_data.get('mac_address')}")
            return True
        else:
            logger.error(f"DPP設定適用失敗: デバイス {device_data.get('mac_address')}")
            return False
            
    except Exception as e:
        logger.error(f"DPP設定適用中にエラーが発生しました: {str(e)}")
        return False


def _execute_dpp_provisioning(device_data: Dict, conf_json: str) -> bool:
    """
    DPPプロビジョニングの実際の実行
    """
    import subprocess
    from .config import settings
    
    mac_address = device_data.get('mac_address', '')
    channel = device_data.get('channel', '')
    
    logger.info(f"DPPプロビジョニング実行開始: MAC={mac_address}, Channel={channel}")
    
    try:
        # Step 1: DPP Configuratorを追加
        logger.info("Step 1: DPP Configurator追加")
        configurator_cmd = [
            "python", "-m", "provisioning_cli.main",
            settings.dpp_interface,
            "DPP_CONFIGURATOR_ADD"
        ]
        
        result = subprocess.run(
            configurator_cmd,
            cwd=settings.cli_script_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            logger.error(f"DPP Configurator追加失敗: stdout={result.stdout}, stderr={result.stderr}")
            return False
        
        configurator_id = result.stdout.strip()
        logger.info(f"DPP Configurator追加成功: ID={configurator_id}")
        
        # Step 2: QRコード情報でデバイスを追加
        logger.info("Step 2: QRコード情報でデバイス追加")
        
        # DPP QRコード文字列を構築
        key = device_data.get('key', '')
        if not key:
            logger.error("暗号化キー情報が見つかりません")
            return False
        
        # DPP QRコード文字列の構築: "DPP:C:channel;M:mac_address;K:key;;"
        qr_code_data = f"DPP:C:{channel};M:{mac_address};K:{key};;"
        logger.info(f"構築されたDPP QRコード: {qr_code_data[:50]}...")  # セキュリティのため最初の50文字のみログ出力
        
        qr_cmd = [
            "python", "-m", "provisioning_cli.main",
            settings.dpp_interface,
            "DPP_QR_CODE",
            qr_code_data
        ]
        
        result = subprocess.run(
            qr_cmd,
            cwd=settings.cli_script_path,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            logger.error(f"QRコード追加失敗: stdout={result.stdout}, stderr={result.stderr}")
            return False
        
        bootstrap_id = result.stdout.strip()
        logger.info(f"QRコード追加成功: ID={bootstrap_id}")
        
        # Step 3: DPP認証と設定送信
        logger.info("Step 3: DPP認証と設定送信")
        auth_cmd = [
            "python", "-m", "provisioning_cli.main",
            settings.dpp_interface,
            "DPP_AUTH_INIT",
            f"peer={bootstrap_id}",
            f"configurator={configurator_id}",
            f"conf_json={conf_json}"
        ]
        
        result = subprocess.run(
            auth_cmd,
            cwd=settings.cli_script_path,
            capture_output=True,
            text=True,
            timeout=settings.dpp_timeout
        )
        
        if result.returncode != 0:
            logger.error(f"DPP認証失敗: stdout={result.stdout}, stderr={result.stderr}")
            return False
        
        logger.info(f"DPP認証成功: {result.stdout}")
        return True
        
    except subprocess.TimeoutExpired:
        logger.error("DPP設定適用がタイムアウトしました")
        return False
    except FileNotFoundError as e:
        logger.error(f"ファイルまたはコマンドが見つかりません: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"DPP実行中にエラーが発生しました: {str(e)}")
        return False



def get_device_by_id(device_id: int) -> Optional[Dict]:
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


def test_dpp_setup() -> Dict[str, bool]:
    """
    DPP設定のテスト - CLIスクリプトとhostapdの可用性をチェック
    """
    import subprocess
    import os
    from .config import settings
    
    results = {
        "cli_script_exists": False,
        "hostapd_socket_exists": False,
        "cli_script_executable": False,
        "interface_available": False
    }
    
    try:
        # CLIスクリプトパスの存在確認
        results["cli_script_exists"] = os.path.exists(settings.cli_script_path)
        logger.info(f"CLIスクリプトパス: {settings.cli_script_path} - {'存在' if results['cli_script_exists'] else '存在しない'}")
        
        # hostapdソケットの存在確認
        socket_path = os.path.join(settings.hostapd_socket_dir, settings.dpp_interface)
        results["hostapd_socket_exists"] = os.path.exists(socket_path)
        logger.info(f"hostapdソケット: {socket_path} - {'存在' if results['hostapd_socket_exists'] else '存在しない'}")
        
        # CLIスクリプトの実行可能性テスト
        if results["cli_script_exists"]:
            test_cmd = ["python", "-m", "provisioning_cli.main", "--help"]
            try:
                result = subprocess.run(
                    test_cmd,
                    cwd=settings.cli_script_path,
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                results["cli_script_executable"] = result.returncode == 0
                logger.info(f"CLIスクリプト実行テスト: {'成功' if results['cli_script_executable'] else '失敗'}")
            except Exception as e:
                logger.error(f"CLIスクリプト実行テストエラー: {str(e)}")
        
        # インターフェースの可用性確認（簡易）
        try:
            import netifaces
            interfaces = netifaces.interfaces()
            results["interface_available"] = settings.dpp_interface in interfaces
            logger.info(f"インターフェース {settings.dpp_interface}: {'利用可能' if results['interface_available'] else '利用不可'}")
        except ImportError:
            logger.warning("netifacesがインストールされていません。インターフェースチェックをスキップします。")
            # 代替チェック: /sys/class/net/ を使用
            try:
                import os
                net_path = f"/sys/class/net/{settings.dpp_interface}"
                results["interface_available"] = os.path.exists(net_path)
                logger.info(f"インターフェース {settings.dpp_interface} (代替チェック): {'利用可能' if results['interface_available'] else '利用不可'}")
            except Exception:
                logger.warning("インターフェースの確認ができませんでした。デフォルトで利用可能とします。")
                results["interface_available"] = True
        
    except Exception as e:
        logger.error(f"DPP設定テスト中にエラーが発生しました: {str(e)}")
    
    return results


def get_dpp_status() -> Dict[str, str]:
    """
    現在のDPP設定状況を取得
    """
    from .config import settings
    
    return {
        "interface": settings.dpp_interface,
        "timeout": str(settings.dpp_timeout),
        "socket_dir": settings.hostapd_socket_dir,
        "cli_path": settings.cli_script_path
    }
def update_device(device_id: int, update_data: Dict) -> bool:
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