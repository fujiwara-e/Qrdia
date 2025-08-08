'use client';
import { useState, useEffect } from 'react';
import { ConfigForm } from '@/components/ConfigForm';
import { getDevices } from '@/lib/api';
import { QRScanner } from '@/components/QRScanner';
import { HistoryTable } from '@/components/HistoryTable';
import { ScannedDevicesTable } from '@/components/ScannedDevicesTable';
import { Layout } from '@/components/Layout';
import type { WiFiConfig, Device, QRData } from '@/lib/types';

export default function HomePage() {

  const [history, setHistory] = useState<Device[]>([]);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({ ssid: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // バックエンドAPIからデバイス履歴を取得
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        const devices = await getDevices();
        setHistory(devices);
      } catch (error) {
        console.error('デバイス取得エラー:', error);
        setError('デバイス履歴の取得に失敗しました');
        // エラー時は空の配列を設定
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
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

  const handleConfigApplied = (mac_address: string) => {
    const targetDevice = scannedDevices.find(d => d.mac_address === mac_address);
    if (!targetDevice) return;

    const newHistoryDevice: Device = {
      ...targetDevice,
      date: new Date().toISOString(),
      ssid: wifiConfig.ssid,
      password: wifiConfig.password,
      status: 'configured',
    };
    setHistory(prev => [newHistoryDevice, ...prev]);
    setScannedDevices(prev => prev.filter(d => d.mac_address !== mac_address));
  };

  const handleApplyAll = async () => {
    setIsApplyingAll(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    const newHistoryDevices = scannedDevices.map(device => ({
      ...device,
      date: new Date().toISOString(),
      ssid: wifiConfig.ssid,
      password: wifiConfig.password,
      status: 'configured',
    } as Device));

    setHistory(prev => [...newHistoryDevices, ...prev]);
    setScannedDevices([]);
    setIsApplyingAll(false);
  };

  const handleSaveDevice = (updatedDevice: Device) => {
    setHistory(prev => prev.map(d =>
      (d.mac_address === updatedDevice.mac_address && d.date === updatedDevice.date)
        ? updatedDevice
        : d
    ));
  };

  return (
    <Layout>
      {loading && <div className="text-center p-4">デバイス履歴を読み込み中...</div>}
      <div className="grid grid-cols-1 md:grid-cols-[29%_54%_14%] gap-6">
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
