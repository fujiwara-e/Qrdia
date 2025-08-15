import type { Device, ApiResponse, CreateDeviceRequest, CreateDeviceResponse } from './types';
import { DemoManager } from './demo';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://your-production-api-url.com'
    : 'http://127.0.0.1:8000';

// For Client Component
export async function getDevicesClient(): Promise<Device[]> {
    if (DemoManager.isDemoMode()) {
        // デモモード: localStorage からデータを取得
        return DemoManager.getHistory();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/devices`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<Device[]> = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'デバイス取得に失敗しました');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching devices:', error);
        throw error;
    }
}

// For Server Component
export async function getDevicesServer(): Promise<Device[]> {
    // サーバーサイドではデモモード判定ができないため、常に空配列を返す
    // クライアントサイドでデモモードの場合は、HomePageで初期化される
    try {
        const response = await fetch(`${API_BASE_URL}/api/devices`, {
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ApiResponse<Device[]> = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'デバイス取得に失敗しました');
        }

        return result.data;
    } catch (error) {
        console.error('Error fetching devices on server:', error);
        return [];
    }
}

export async function updateDevice(deviceId: number, updateData: Partial<Device>): Promise<Device> {
    if (DemoManager.isDemoMode()) {
        // デモモード: localStorage を更新
        return DemoManager.updateDevice(deviceId, updateData);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error || 'デバイス更新に失敗しました');
        }

        return result.data;
    } catch (error) {
        console.error('Error updating device:', error);
        throw error;
    }
}

export async function createNewDevice(request: CreateDeviceRequest): Promise<CreateDeviceResponse> {
    if (DemoManager.isDemoMode()) {
        // デモモード: プロビジョニングをシミュレート
        return DemoManager.simulateProvisioning(request);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/devices/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `HTTP error! status: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Error creating new device:', error);
        throw error;
    }
}