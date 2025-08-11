from pydantic import BaseModel
from typing import List, Optional


class Device(BaseModel):
    id: int
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
    mac_address: str
    channel: str
    key: str
    ssid: str
    password: str


class NewDeviceResponseData(BaseModel):
    id: int
    mac_address: str
    status: str
    message: str
    date: str


class NewDeviceResponse(BaseModel):
    success: bool
    data: NewDeviceResponseData


class UpdateDeviceRequest(BaseModel):
    name: Optional[str] = None
    ssid: Optional[str] = None
    password: Optional[str] = None
    room: Optional[str] = None
    desc: Optional[str] = None
    status: Optional[str] = None


class UpdateDeviceResponse(BaseModel):
    success: bool
    data: Optional[Device] = None
    message: str
