'use client';

import React, { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ConfigForm } from '@/components/ConfigForm';
import { QRScanner } from '@/components/QRScanner';
import { HistoryTable } from '@/components/HistoryTable';
import { Layout } from '@/components/Layout';
import type { WiFiConfig, Device, QRData } from '@/lib/types';

export default function MainPage() {
  const [history, setHistory] = useLocalStorage<Device[]>('history', []);
  const [scannedDevices, setScannedDevices] = useState<QRData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (data: QRData) => {
    // QRData型の必須プロパティをチェック
    if (!data.mac_address || !data.channel || !data.key) {
      setError('QRコードのデータ形式が正しくありません');
      return;
    }
    // Device型に変換（履歴保存用）
    const device: Device = {
      date: new Date().toISOString(),
      ssid: '',
      password: '',
      mac_address: data.mac_address,
      channel: data.channel,
      key: data.key,
    };
    setHistory((prev) => [device, ...prev]);
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

    setTimeout(() => {
      setLoading(false);
      setError(null)
    }, 1000);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <HistoryTable history={history} />
        </div>
        <div>
          <h2 className="font-bold mb-2">Scanned Devices</h2>
          {scannedDevices.length > 0 ? (
            <table className="w-full border rounded mb-2">
              <thead>
                <tr>
                  <th>MAC</th>
                  <th>Channel</th>
                  <th>Key</th>
                </tr>
              </thead>
              <tbody>
                {scannedDevices.map((d, i) => (
                  <tr key={i}>
                    <td>{d.mac_address}</td>
                    <td>{d.channel}</td>
                    <td>{d.key}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No Scanned Devices</p>
          )}
        </div>
        <div>
          <ConfigForm
            onSubmit={handleConfigSubmit}
            disabled
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
