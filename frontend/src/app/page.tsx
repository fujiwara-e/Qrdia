'use client';

import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ConfigForm } from '@/components/ConfigForm';
import { generateMockData, storage } from '@/lib/utils';
import { QRScanner } from '@/components/QRScanner';
import { HistoryTable } from '@/components/HistoryTable';
import { ArrowButton } from '@/components/ui/Button';
import { ScannedDevicesTable } from '@/components/ScannedDevicesTable';
import { Layout } from '@/components/Layout';
import type { WiFiConfig, Device, QRData } from '@/lib/types';

export default function HomePage() {

  const [history, setHistory] = useLocalStorage<Device[]>('history', []);
  const [scannedDevices, setScannedDevices] = useState<QRData[]>([]);
  // localStorageが空ならmockデータを挿入
  useEffect(() => {
    const current = storage.get<Device[]>('history', []);
    if (!current || current.length === 0) {
      const mock = generateMockData();
      setHistory(mock);
    }
  }, [setHistory]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: QRData) => {
    // QRData型の必須プロパティをチェック
    if (!data.mac_address || !data.channel || !data.key) {
      setError('QRコードのデータ形式が正しくありません');
      return;
    }
    setScannedDevices((prev) => {
      // 重複MACアドレスは追加しない
      if (prev.some(d => d.mac_address === data.mac_address)) return prev;
      return [...prev, data];
    });
    setError(null);
  };

  const handleConfigSubmit = async (config: WiFiConfig) => {
    setLoading(true);
    setError(null);

    const newDevices: Device[] = scannedDevices.map((d) => ({
      date: new Date().toISOString(),
      ssid: config.ssid,
      password: config.password,
      mac_address: d.mac_address,
      channel: d.channel,
      key: d.key,
    }));
    setHistory((prev) => [...newDevices, ...prev]);

    setTimeout(() => {
      setLoading(false);
      setError(null)
    }, 1000);
  };



  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-[29%_54%_14%] gap-6">
        <div>
          <HistoryTable history={history} />
        </div>
        <div>
          <ScannedDevicesTable devices={scannedDevices} />
        </div>
        <div>
          <ConfigForm
            onSubmit={handleConfigSubmit}
            disabled={scannedDevices.length === 0}
            loading={loading}
            devices={scannedDevices.map(d => ({
              date: '',
              ssid: '',
              password: '',
              mac_address: d.mac_address,
              channel: d.channel,
              key: d.key,
            }))}
          />
        </div>
      </div>
      <div className="mt-8">
        <QRScanner onQrDetected={handleScan} />
      </div>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </Layout>
  );
}
