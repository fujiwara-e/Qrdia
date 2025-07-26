'use client';
import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ConfigForm } from '@/components/ConfigForm';
import { generateMockData, storage } from '@/lib/utils';
import { QRScanner } from '@/components/QRScanner';
import { HistoryTable } from '@/components/HistoryTable';
import { ScannedDevicesTable } from '@/components/ScannedDevicesTable';
import { Layout } from '@/components/Layout';
import type { WiFiConfig, Device, QRData } from '@/lib/types';

export default function HomePage() {

  const [history, setHistory] = useLocalStorage<Device[]>('history', []);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [wifiConfig, setWifiConfig] = useState<WiFiConfig>({ ssid: 'default-ssid', password: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const current = storage.get<Device[]>('history', []);
    if (!current || current.length === 0) {
      const mock = generateMockData();
      setHistory(mock);
    }
  }, [setHistory]);

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

  const handleApplyConfig = async (mac_address: string) => {
    const targetDevice = scannedDevices.find(d => d.mac_address === mac_address);
    if (!targetDevice) return;

    setScannedDevices(prev => prev.map(d => d.mac_address === mac_address ? { ...d, status: 'configuring' } : d));

    await new Promise(resolve => setTimeout(resolve, 1000));

    const newHistoryDevice: Device = {
      ...targetDevice,
      date: new Date().toISOString(),
      ssid: wifiConfig.ssid,
      password: wifiConfig.password,
      status: 'configured',
    };
    setHistory(prev => [newHistoryDevice, ...prev]);

    setScannedDevices(prev => prev.map(d => d.mac_address === mac_address ? { ...d, status: 'configured' } : d));
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-[29%_54%_14%] gap-6">
        <div>
          <HistoryTable history={history} />
        </div>
        <div>
          <ScannedDevicesTable devices={scannedDevices} onApplyConfig={handleApplyConfig} />
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
