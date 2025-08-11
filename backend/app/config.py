import os


class Settings:
    app_name: str = "Device Management API"
    version: str = "1.0.0"
    cors_origins: list = ["http://localhost:3000"]
    host: str = "0.0.0.0"
    port: int = 8000


settings = Settings()
