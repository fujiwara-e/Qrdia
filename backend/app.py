from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import logging
import os
import time
import random
from concurrent.futures import ThreadPoolExecutor

# ログ設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='dpp_configurator.log',
    filemode='a'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # CORS対策

# 設定値
INTERFACE = "wlo1"                  # インターフェース名
DPP_CONFIGURATOR_PATH = "/home/fujiwara-e/git/dps-demo/backend/dpp-configurator"  # DPP configuratorの絶対パス

# ランダムなユニキャストMACアドレスを生成する関数
def generate_random_unicast_mac():
    """
    ユニキャストMACアドレスをランダムに生成する
    - 最初のバイトの下位2ビットは0（ユニキャストアドレスを示す）
    - かつ、最初のバイトの下から2番目のビットは0（ローカルアドレスを示す）
    """
    mac = [random.randint(0, 255) for _ in range(6)]
    # 最初のバイトを調整: ユニキャストかつローカルアドレスに設定
    mac[0] = (mac[0] & 0xFC) | 0x02  # 下位2ビット: b10 (ユニキャスト＋ローカル)
    
    # MACアドレスをフォーマット
    return ':'.join([f'{b:02x}' for b in mac])

# 単一デバイスの設定処理関数
def configure_single_device(bootstrap_key, dst_mac_addr):
    try:
        # ランダムなユニキャストMACアドレスを生成
        src_mac_addr = generate_random_unicast_mac()
        logger.info(f"Generated random unicast MAC: {src_mac_addr} for device {dst_mac_addr}")
        
        # dpp-configuratorコマンドを実行
        cmd = [
            "sudo", 
            DPP_CONFIGURATOR_PATH, 
            INTERFACE, 
            bootstrap_key, 
            dst_mac_addr, 
            src_mac_addr  # ランダム生成したMACアドレスを使用
        ]
        
        logger.info(f"Executing command for {dst_mac_addr} with src MAC {src_mac_addr}: {' '.join(cmd)}")
        
        # サブプロセスとして実行
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            check=False
        )
        
        # 実行結果をログに記録
        logger.info(f"Command for {dst_mac_addr} stdout: {result.stdout}")
        if result.stderr:
            logger.error(f"Command for {dst_mac_addr} stderr: {result.stderr}")
        
        return {
            "mac_address": dst_mac_addr,
            "src_mac_address": src_mac_addr,
            "success": result.returncode == 0,
            "message": result.stdout if result.returncode == 0 else result.stderr
        }
    except Exception as e:
        logger.error(f"Error configuring device {dst_mac_addr}: {str(e)}")
        return {
            "mac_address": dst_mac_addr,
            "success": False,
            "message": str(e)
        }

@app.route('/api/configure', methods=['POST'])
def configure_dpp():
    try:
        # リクエストからデータを取得
        data = request.json
        
        # フロントエンドから送られてくるデータを処理
        if 'devices' in data:
            # 複数デバイスモード
            devices = data['devices']
            if not devices or not isinstance(devices, list):
                return jsonify({"status": "error", "message": "Devices must be a non-empty list"}), 400
            
            # SSIDとパスワードはログ記録のみ（実際のコマンドには使用しない）
            ssid = data.get('ssid', 'unknown')
            password = '********'  # パスワードは記録しない
            
            logger.info(f"Received request for {len(devices)} devices with SSID: {ssid}")
            
            results = []
            
            # 並列処理で複数デバイスに設定を適用
            with ThreadPoolExecutor(max_workers=min(5, len(devices))) as executor:
                futures = []
                for device in devices:
                    if 'key' not in device or 'mac_address' not in device:
                        continue
                    
                    futures.append(
                        executor.submit(
                            configure_single_device, 
                            device['key'], 
                            device['mac_address']
                        )
                    )
                    
                    # 処理間隔を少し空ける
                    time.sleep(0.2)
                
                # 結果を収集
                for future in futures:
                    results.append(future.result())
            
            # 全体の結果を集計
            success_count = sum(1 for r in results if r['success'])
            
            return jsonify({
                "status": "success" if success_count > 0 else "partial_failure",
                "message": f"{success_count}/{len(devices)} devices configured successfully",
                "details": results
            })
        
        else:
            # 従来の単一デバイスモード（後方互換性のため）
            key = data.get('key', '')
            mac_address = data.get('mac_address', '')
            
            if not key or not mac_address:
                return jsonify({"status": "error", "message": "Missing key or mac_address"}), 400
            
            # 単一デバイスを設定
            result = configure_single_device(key, mac_address)
            
            return jsonify({
                "status": "success" if result['success'] else "error",
                "message": result['message'],
                "details": [result]
            })
            
    except Exception as e:
        logger.error(f"Error in /api/configure: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    # 起動時にランダムMACアドレスのテスト
    test_mac = generate_random_unicast_mac()
    logger.info(f"Application starting. Test random unicast MAC: {test_mac}")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
