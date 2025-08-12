import os


class Settings:
    app_name: str = "Device Management API"
    version: str = "1.0.0"
    cors_origins: list = ["http://localhost:3000"]
    host: str = "0.0.0.0"
    port: int = 8000
    
    # DPP設定
    dpp_interface: str = os.getenv("DPP_INTERFACE", "test")
    dpp_timeout: int = int(os.getenv("DPP_TIMEOUT", "30"))
    hostapd_socket_dir: str = os.getenv("HOSTAPD_SOCKET_DIR", "/var/run/hostapd")
    
    # CLIスクリプトのパス
    cli_script_path: str = os.getenv(
        "CLI_SCRIPT_PATH",
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "cli")
    )


settings = Settings()
