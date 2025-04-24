from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import logging
import os

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

@app.route('/api/configure', methods=['POST'])
def configure_dpp():
    try:
        # リクエストからデータを取得
        data = request.json
        
        # 必須パラメータのバリデーション
        required_fields = ['key', 'mac_address']
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing required field: {field}"}), 400
        
        bootstrap_key = data['key']
        dst_mac_addr = data['mac_address']
        
        # リクエストデータをログに記録（パスワードは記録しない）
        log_data = {k: v for k, v in data.items() if k != 'password'}
        logger.info(f"Received request: {log_data}")
        
        # dpp-configuratorコマンドを実行
        cmd = [
            "sudo", 
            DPP_CONFIGURATOR_PATH, 
            INTERFACE, 
            bootstrap_key, 
            dst_mac_addr, 
            SRC_MAC_ADDR
        ]
        
        logger.info(f"Executing command: {' '.join(cmd)}")
        
        # サブプロセスとして実行
        result = subprocess.run(
            cmd, 
            capture_output=True, 
            text=True, 
            check=False
        )
        
        # 実行結果をログに記録
        logger.info(f"Command stdout: {result.stdout}")
        if result.stderr:
            logger.error(f"Command stderr: {result.stderr}")
        
        # 終了コードを確認
        if result.returncode == 0:
            return jsonify({
                "status": "success",
                "message": "Configuration successfully applied"
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"Error executing dpp-configurator: {result.stderr}"
            }), 400
            
    except Exception as e:
        logger.error(f"Error in /api/configure: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Internal server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
