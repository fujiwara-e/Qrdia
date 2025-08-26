'use client';
import { useState, useEffect } from 'react';
import { ConfigForm } from '@/components/ConfigForm';
import { QRScanner } from '@/components/QRScanner';
import { HistoryTable } from '@/components/HistoryTable';
import { ScannedDevicesTable } from '@/components/ScannedDevicesTable';
import { Layout } from '@/components/Layout';
import { getDevicesClient, createNewDevice } from '@/lib/api';
import { DemoManager } from '@/lib/demo';
import type { WiFiConfig, Device, QRData, CreateDeviceRequest } from '@/lib/types';

interface HomePageProps {
    initialHistory: Device[];
}

export default function HomePage({ initialHistory }: HomePageProps) {
    const [history, setHistory] = useState<Device[]>(initialHistory);
    const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
    const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({ ssid: '', password: '' });
    const [error, setError] = useState<string | null>(null);

    // クライアントサイドでデモモードの初期化を行う
    useEffect(() => {
        if (DemoManager.isDemoMode()) {
            DemoManager.initializeDemoData();
            const demoHistory = DemoManager.getHistory();
            setHistory(demoHistory);
        }
    }, []);

    const handleScan = (data: QRData) => {
        if (!data.mac_address || !data.channel || !data.key) {
            setError('QRコードのデータ形式が正しくありません');
            return;
        }
        setScannedDevices((prev) => {
            if (prev.some(d => d.mac_address === data.mac_address)) return prev;
            const newDevice: Device = { ...data, status: 'scanned' };
            return [...prev, newDevice];
        });
        setError(null);
    };

    const [isApplyingAll, setIsApplyingAll] = useState(false);

    const handleConfigApplied = async (mac_address: string) => {
        const targetDevice = scannedDevices.find(d => d.mac_address === mac_address);
        if (!targetDevice) return;

        // デモモード時: リアルタイムでステータス更新
        if (DemoManager.isDemoMode()) {
            // まず「設定中」ステータスに変更
            setScannedDevices(prev => prev.map(d =>
                d.mac_address === mac_address
                    ? { ...d, status: 'configuring' }
                    : d
            ));
        }

        try {
            const createRequest: CreateDeviceRequest = {
                mac_address: targetDevice.mac_address,
                channel: targetDevice.channel,
                key: targetDevice.key,
                ssid: wifiConfig.ssid,
                password: wifiConfig.password,
            };

            const response = await createNewDevice(createRequest);

            if (response.success) {
                // 成功時: historyを更新し、scannedDevicesのstatusを更新
                const newHistoryDevice: Device = {
                    ...targetDevice,
                    id: response.data.id,
                    date: response.data.date,
                    ssid: wifiConfig.ssid,
                    password: wifiConfig.password,
                    status: response.data.status as Device['status'],
                };
                setHistory(prev => [newHistoryDevice, ...prev]);
                setScannedDevices(prev => prev.map(d =>
                    d.mac_address === mac_address
                        ? { ...d, status: 'configured', ssid: wifiConfig.ssid, password: wifiConfig.password }
                        : d
                ));
                setError(null);
            }
        } catch (error) {
            // エラー時: ステータスをエラーに変更
            if (DemoManager.isDemoMode()) {
                setScannedDevices(prev => prev.map(d =>
                    d.mac_address === mac_address
                        ? { ...d, status: 'error' }
                        : d
                ));
            }
            setError(`デバイス設定に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleApplyAll = async () => {
        setIsApplyingAll(true);
        setError(null);

        try {
            const results = await Promise.allSettled(
                scannedDevices.map(device =>
                    createNewDevice({
                        mac_address: device.mac_address,
                        channel: device.channel,
                        key: device.key,
                        ssid: wifiConfig.ssid,
                        password: wifiConfig.password,
                    })
                )
            );

            const successfulDevices: Device[] = [];
            const failedDevices: string[] = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value.success) {
                    const device = scannedDevices[index];
                    successfulDevices.push({
                        ...device,
                        id: result.value.data.id,
                        date: result.value.data.date,
                        ssid: wifiConfig.ssid,
                        password: wifiConfig.password,
                        status: result.value.data.status as Device['status'],
                    });
                } else {
                    failedDevices.push(scannedDevices[index].mac_address);
                }
            });

            // 成功したデバイスをhistoryに追加
            if (successfulDevices.length > 0) {
                setHistory(prev => [...successfulDevices, ...prev]);
            }

            // 成功したデバイスのstatusを'configured'に更新
            setScannedDevices(prev =>
                prev.map(device => {
                    const successDevice = successfulDevices.find(success => success.mac_address === device.mac_address);
                    return successDevice
                        ? { ...device, status: 'configured', ssid: wifiConfig.ssid, password: wifiConfig.password }
                        : device;
                })
            );

            // エラーメッセージの表示
            if (failedDevices.length > 0) {
                setError(`一部のデバイス設定に失敗しました: ${failedDevices.join(', ')}`);
            }
        } catch (error) {
            setError(`デバイス設定に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsApplyingAll(false);
        }
    };

    const handleSaveDevice = async (updatedDevice: Device) => {
        if (DemoManager.isDemoMode()) {
            // デモモード: localStorage を更新
            if (updatedDevice.id) {
                DemoManager.updateDevice(updatedDevice.id, updatedDevice);
                setHistory(DemoManager.getHistory());
            }
            return;
        }

        try {
            const refreshedDevices = await getDevicesClient();
            setHistory(refreshedDevices);
        } catch (error) {
            console.error('デバイスリストの再取得に失敗:', error);
            // エラーが発生した場合はローカル状態のみ更新
            setHistory(prev => prev.map(d =>
                d.id === updatedDevice.id ? updatedDevice : d
            ));
        }
    };

    return (
        <Layout>
            <div className="grid grid-cols-1 md:grid-cols-[45%_41%_12%] gap-6">
                <div>
                    <HistoryTable history={history} onSave={handleSaveDevice} />
                </div>
                <div>
                    <ScannedDevicesTable
                        devices={scannedDevices}
                        config={wifiConfig}
                        onConfigApplied={handleConfigApplied}
                        onApplyAll={handleApplyAll}
                        isApplyingAll={isApplyingAll}
                    />
                </div>
                <div>
                    <ConfigForm
                        config={wifiConfig}
                        onConfigChange={setWifiConfig}
                        disabled={scannedDevices.length === 0}
                    />
                </div>
            </div>
            <QRScanner onQrDetected={handleScan} />
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </Layout>
    );
}
