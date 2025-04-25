from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import logging
import os
import time
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
SRC_MAC_ADDR = "12:22:33:44:55:66"  # 送信元MACアドレス
INTERFACE = "wlo1"                  # インターフェース名
DPP_CONFIGURATOR_PATH = "/home/fujiwara-e/git/dps-demo/backend/dpp-configurator"  # DPP configuratorの絶対パス

# 単一デバイスの設定処理関数
def configure_single_device(bootstrap_key, dst_mac_addr, ssid, password):
    try:
        # dpp-configuratorコマンドを実行
        cmd = [
            "sudo", 
            DPP_CONFIGURATOR_PATH, 
            INTERFACE, 
            bootstrap_key, 
            dst_mac_addr, 
            SRC_MAC_ADDR,
            ssid,
            password
        ]
        
        logger.info(f"Executing command for {dst_mac_addr}: {' '.join(cmd[:6])} [SSID] [PASSWORD]")
        
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
        
        # 必須パラメータのバリデーション
        required_fields = ['devices', 'ssid', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing required field: {field}"}), 400
        
        devices = data['devices']
        ssid = data['ssid']
        password = data['password']
        
        if not devices or not isinstance(devices, list):
            return jsonify({"status": "error", "message": "Devices must be a non-empty list"}), 400
        
        # リクエストデータをログに記録（パスワードは記録しない）
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
                        device['mac_address'], 
                        ssid, 
                        password
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
            
    except Exception as e:
        logger.error(f"Error in /api/configure: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
