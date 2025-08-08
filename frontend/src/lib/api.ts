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