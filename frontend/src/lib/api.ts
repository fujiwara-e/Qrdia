import type { Device, ApiResponse } from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://your-production-api-url.com'
    : 'http://localhost:8000';

// For Client Component
export async function getDevicesClient(): Promise<Device[]> {
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

export async function updateDevice(deviceId: string, updateData: Partial<Device>): Promise<Device> {
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