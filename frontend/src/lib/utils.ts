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
            ssid: 'MyHomeWiFi',
            password: 'securePass123',
            mac_address: 'AA:BB:CC:DD:EE:FF',
            channel: 6,
            key: 'A1B2C3D4E5F6G7H8I9J0'
        },
        {
            date: new Date('2025-04-23T15:45:22').toISOString(),
            ssid: 'OfficeNetwork',
            password: 'office@2025',
            mac_address: '11:22:33:44:55:66',
            channel: 11,
            key: 'K1L2M3N4O5P6Q7R8S9T0'
        },
        {
            date: new Date('2025-04-22T09:12:05').toISOString(),
            ssid: 'CafeWiFi',
            password: 'cafe2025!',
            mac_address: 'AB:CD:EF:12:34:56',
            channel: 1,
            key: 'U1V2W3X4Y5Z6a7b8c9d0'
        }

    ];
}