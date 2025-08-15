from fastapi import APIRouter, HTTPException
from ..models import (
    Device, DeviceResponse, NewDeviceRequest, NewDeviceResponse, 
    NewDeviceResponseData, UpdateDeviceRequest, UpdateDeviceResponse
)
from ..database import (
    get_all_devices, create_new_device_with_configuration, 
    get_device_by_id, update_device
)

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.get("", response_model=DeviceResponse)
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


@router.post("/new", response_model=NewDeviceResponse)
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
        device_data = {
            "mac_address": device_request.mac_address,
            "channel": device_request.channel,
            "key": device_request.key,
            "ssid": device_request.ssid,
            "password": device_request.password,
            "name": None,
            "room": None,
            "desc": None
        }
        
        device_id, status_message = create_new_device_with_configuration(device_data)
        
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


@router.put("/{device_id}", response_model=UpdateDeviceResponse)
async def update_device_endpoint(device_id: int, update_request: UpdateDeviceRequest):
    """デバイス情報更新"""
    try:
        # デバイスの存在確認
        existing_device = get_device_by_id(device_id)
        if not existing_device:
            raise HTTPException(
                status_code=404,
                detail={
                    "success": False,
                    "error": "指定されたデバイスが見つかりません",
                    "error_code": "DEVICE_NOT_FOUND"
                }
            )
        
        # 更新データの準備（Noneでない値のみ）
        update_data = {}
        for field, value in update_request.dict().items():
            if value is not None:
                update_data[field] = value
        
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail={
                    "success": False,
                    "error": "更新するデータが指定されていません",
                    "error_code": "NO_UPDATE_DATA"
                }
            )
        
        # statusの値の検証
        if 'status' in update_data:
            valid_statuses = ['scanned', 'configuring', 'configured', 'error']
            if update_data['status'] not in valid_statuses:
                raise HTTPException(
                    status_code=400,
                    detail={
                        "success": False,
                        "error": f"無効なステータスです。有効な値: {', '.join(valid_statuses)}",
                        "error_code": "INVALID_STATUS"
                    }
                )
        
        # デバイス情報の更新
        update_success = update_device(device_id, update_data)
        
        if not update_success:
            raise HTTPException(
                status_code=500,
                detail={
                    "success": False,
                    "error": "デバイス情報の更新に失敗しました",
                    "error_code": "UPDATE_FAILED"
                }
            )
        
        # 更新後のデバイス情報を取得
        updated_device = get_device_by_id(device_id)
        device = Device(**updated_device)
        
        return UpdateDeviceResponse(
            success=True,
            data=device,
            message="デバイス情報が正常に更新されました"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "error": f"デバイス更新中にエラーが発生しました: {str(e)}",
                "error_code": "INTERNAL_SERVER_ERROR"
            }
        )