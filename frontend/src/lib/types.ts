export interface BasicDeviceInfo {
    mac_address: string;
    channel: string;
    key: string;
}

export interface ExtraDeviceInfo {
    id: number;
    date: string;
    name: string;
    ssid: string;
    status: 'scanned' | 'configuring' | 'configured' | 'error';
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

export interface CreateDeviceRequest {
    mac_address: string;
    channel: string;
    key: string;
    ssid: string;
    password: string;
}

export interface CreateDeviceResponseData {
    id: number;
    mac_address: string;
    status: string;
    message: string;
    date: string;
}

export interface CreateDeviceResponse {
    success: boolean;
    data: CreateDeviceResponseData;
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