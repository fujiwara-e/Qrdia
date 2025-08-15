import type { Device, CreateDeviceRequest, CreateDeviceResponse } from './types';

const DEMO_MODE_KEY = 'qrdia_demo_mode';
const DEMO_HISTORY_KEY = 'qrdia_demo_history';

export class DemoManager {
    static isDemoMode(): boolean {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(DEMO_MODE_KEY) === 'true';
    }

    static setDemoMode(enabled: boolean): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(DEMO_MODE_KEY, enabled.toString());
    }

    static getHistory(): Device[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(DEMO_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static addToHistory(device: Device): void {
        if (typeof window === 'undefined') return;
        const history = this.getHistory();
        history.unshift(device); // 新しいデバイスを先頭に追加
        localStorage.setItem(DEMO_HISTORY_KEY, JSON.stringify(history));
    }

    static updateDevice(id: number, updates: Partial<Device>): Device {
        if (typeof window === 'undefined') throw new Error('Cannot update device on server');

        const history = this.getHistory();
        const deviceIndex = history.findIndex(d => d.id === id);

        if (deviceIndex === -1) {
            throw new Error('Device not found');
        }

        const updatedDevice = { ...history[deviceIndex], ...updates };
        history[deviceIndex] = updatedDevice;
        localStorage.setItem(DEMO_HISTORY_KEY, JSON.stringify(history));

        return updatedDevice;
    }

    static generateMockId(): number {
        // 現在の履歴から最大IDを取得し、+1
        const history = this.getHistory();
        const maxId = history.reduce((max, device) =>
            device.id ? Math.max(max, device.id) : max, 0);
        return maxId + 1;
    }

    static async simulateProvisioning(request: CreateDeviceRequest): Promise<CreateDeviceResponse> {
        // 2-3秒の遅延をシミュレート
        const delay = 2000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        const mockId = this.generateMockId();
        const now = new Date().toISOString();

        const responseData = {
            id: mockId,
            mac_address: request.mac_address,
            status: 'configured',
            message: 'デモモード: プロビジョニング完了',
            date: now,
        };

        // 履歴に自動追加
        const newDevice: Device = {
            id: mockId,
            mac_address: request.mac_address,
            channel: request.channel,
            key: request.key,
            date: now,
            name: '',
            ssid: request.ssid,
            password: request.password,
            status: 'configured',
            room: '',
            desc: '',
        };

        this.addToHistory(newDevice);

        return {
            success: true,
            data: responseData,
        };
    }

    static clearDemoData(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(DEMO_HISTORY_KEY);
    }

    static initializeDemoData(): void {
        if (typeof window === 'undefined') return;

        // デモデータが空の場合、サンプルデータを追加
        const history = this.getHistory();
        if (history.length === 0) {
            const sampleDevices: Device[] = [
                {
                    id: 2,
                    mac_address: 'AA:BB:CC:DD:EE:FF',
                    channel: '11',
                    key: 'sample_key_2',
                    date: new Date(Date.now() - 86400000).toISOString(), // 1日前
                    name: 'Sample Device 2',
                    ssid: 'DemoWiFi',
                    password: 'demo123',
                    status: 'configured',
                    room: '寝室',
                    desc: 'デモ用サンプルデバイス2',
                },
                {
                    id: 1,
                    mac_address: '00:11:22:33:44:55',
                    channel: '6',
                    key: 'sample_key_1',
                    date: new Date(Date.now() - 172800000).toISOString(), // 2日前
                    name: 'Sample Device 1',
                    ssid: 'DemoWiFi',
                    password: 'demo123',
                    status: 'configured',
                    room: 'リビング',
                    desc: 'デモ用サンプルデバイス',
                },
            ];

            localStorage.setItem(DEMO_HISTORY_KEY, JSON.stringify(sampleDevices));
        }
    }
}
