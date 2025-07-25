export interface Device {
    date: string;
    ssid: string;
    password: string;
    mac_address: string;
    channel: string;
    key: string;
    matter_pair_code?: string;
}

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