import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Device } from './types'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(date);
}

export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    },
    set: <T>(key: string, value: T): void => {
        if (typeof value === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }
};

export function generateMockData(): Device[] {
    return [
        {
            date: new Date('2025-04-24T10:30:15').toISOString(),
            status: 'success',
            id: '1',
            name: 'Test IoT',
            room: 'Living Room',
            desc: '正常に稼働',
            ssid: 'MyHomeWiFi',
            password: 'securePass123',
            mac_address: 'AA:BB:CC:DD:EE:FF',
            channel: '81/6',
            key: 'A1B2C3D4E5F6G7H8I9J0'
        },
        {
            date: new Date('2025-05-01T08:15:00').toISOString(),
            status: 'error',
            id: '2',
            name: 'Smart Light',
            room: 'Bedroom',
            desc: '点灯しません',
            ssid: 'BedroomWiFi',
            password: 'lightPass456',
            mac_address: '11:22:33:44:55:66',
            channel: '36/2',
            key: 'Z9Y8X7W6V5U4T3S2R1Q0'
        },
        {
            date: new Date('2025-06-10T19:45:30').toISOString(),
            status: 'pending',
            id: '3',
            name: 'Security Camera',
            room: 'Entrance',
            desc: '壊しました',
            ssid: 'EntranceNet',
            password: 'camPass789',
            mac_address: '77:88:99:AA:BB:CC',
            channel: '44/11',
            key: 'Q1W2E3R4T5Y6U7I8O9P0'
        }
    ];
}