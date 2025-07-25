export interface BasicDeviceInfo {
    mac_address: string;
    channel: string;
    key: string;
}

export interface ExtraDeviceInfo {
    id: string;
    date: string;
    name: string;
    ssid: string;
    status: string;
    password: string;
    room: string;
    desc: string;
}

export type Device = BasicDeviceInfo & Partial<ExtraDeviceInfo>;

export interface QRData {
    mac_address: string;
    channel: string;
    key: string;
    pincode?: string;
}

export interface WiFiConfig {
    ssid: string;
    password: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export type CameraStatus = 'idle' | 'starting' | 'scanning' | 'error';

export interface Appstate {
    sccanedDevices: Device[];
    history: Device[];
    loading: boolean;
    error: string | null;
    newDevices: Device[] | null;
}