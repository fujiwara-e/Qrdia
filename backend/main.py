from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from database import init_database, get_all_devices, create_device


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
