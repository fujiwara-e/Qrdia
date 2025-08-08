from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import init_database, get_all_devices, create_device, create_new_device_with_configuration, get_device_by_id


# Pydantic models
class Device(BaseModel):
    id: str
    mac_address: str
    channel: str
    key: str
    date: str
    name: Optional[str] = None
    ssid: Optional[str] = None
    status: str = "scanned"
    password: Optional[str] = None
    room: Optional[str] = None
    desc: Optional[str] = None


class DeviceResponse(BaseModel):
    success: bool
    data: List[Device]


class ErrorResponse(BaseModel):
    success: bool
    error: str
    error_code: str


class NewDeviceRequest(BaseModel):
    # QRコードから取得される情報のみ
    mac_address: str
    channel: str
    key: str
    # WiFi設定情報（必須）
    ssid: str
    password: str
    # 注意: name, room, desc は後でupdate APIで設定する
    # date と status はサーバー側で自動設定


class NewDeviceResponseData(BaseModel):
    id: str
    mac_address: str
    status: str
    message: str
    date: str


class NewDeviceResponse(BaseModel):
    success: bool
    data: NewDeviceResponseData


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_database()
    yield
    # Shutdown (if needed)


app = FastAPI(title="Device Management API", version="1.0.0", lifespan=lifespan)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Device Management API"}


@app.get("/api/devices", response_model=DeviceResponse)
async def get_devices():
    """デバイス一覧取得"""
    try:
        devices_data = get_all_devices()
        devices = [Device(**device) for device in devices_data]
        return DeviceResponse(success=True, data=devices)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": str(e),
                "error_code": "INTERNAL_SERVER_ERROR"
            }
        )


@app.post("/api/devices/new", response_model=NewDeviceResponse)
async def create_new_device(device_request: NewDeviceRequest):
    """新規デバイス登録・設定（QRコードスキャン専用 - 最小限の情報）"""
    try:
        # QRコードから取得される必須データの検証
        if not device_request.mac_address:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "MACアドレスは必須です（QRコードから取得）",
                    "error_code": "VALIDATION_ERROR"
                }
            )
        
        if not device_request.channel or not device_request.key:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "チャンネルとキーは必須です（QRコードから取得）",
                    "error_code": "VALIDATION_ERROR"
                }
            )
        
        # WiFi設定の検証
        if not device_request.ssid or not device_request.password:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "SSID とパスワードは必須です",
                    "error_code": "VALIDATION_ERROR"
                }
            )
        
        # デバイスデータの準備（QRコードスキャン時は最小限の情報のみ）
        device_data = {
            "mac_address": device_request.mac_address,
            "channel": device_request.channel,
            "key": device_request.key,
            "ssid": device_request.ssid,
            "password": device_request.password,
            # name, room, desc は None（後でupdate APIで設定）
            "name": None,
            "room": None,
            "desc": None
            # date と status は create_new_device_with_configuration 内で設定
        }
        
        # 新規デバイスの登録と設定適用
        device_id, status_message = create_new_device_with_configuration(device_data)
        
        # 作成されたデバイス情報を取得
        created_device = get_device_by_id(device_id)
        if not created_device:
            raise HTTPException(
                status_code=500,
                detail={
                    "success": False,
                    "error": "デバイスの作成に失敗しました",
                    "error_code": "INTERNAL_SERVER_ERROR"
                }
            )
        
        response_data = NewDeviceResponseData(
            id=device_id,
            mac_address=device_request.mac_address,
            status=created_device["status"],
            message=status_message,
            date=created_device["date"]
        )
        
        return NewDeviceResponse(success=True, data=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": f"デバイス設定中にエラーが発生しました: {str(e)}",
                "error_code": "CONFIGURATION_FAILED"
            }
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
