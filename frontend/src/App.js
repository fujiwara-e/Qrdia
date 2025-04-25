import React, { useState, useEffect } from 'react';
import './App.css';
import ConfigForm from './components/ConfigForm';
import HistoryTable from './components/HistoryTable';
import QRScanner from './components/QRScanner';
import Layout from './components/Layout';

function App() {
    // スキャン済みのデバイスリスト
    const [scannedDevices, setScannedDevices] = useState([]);
    const [error, setError] = useState(null);

    // モックデータの作成
    const mockData = [
        {
            date: new Date('2025-04-24T10:30:15').toISOString(),
            ssid: 'MyHomeWiFi',
            password: 'securePass123',
            mac_address: 'AA:BB:CC:DD:EE:FF',
            channel: '6',
            key: 'A1B2C3D4E5F6G7H8I9J0'
        },
        {
            date: new Date('2025-04-23T15:45:22').toISOString(),
            ssid: 'OfficeNetwork',
            password: 'office@2025',
            mac_address: '11:22:33:44:55:66',
            channel: '11',
            key: 'K1L2M3N4O5P6Q7R8S9T0'
        },
        {
            date: new Date('2025-04-22T09:12:05').toISOString(),
            ssid: 'CafeWiFi',
            password: 'cafe2025!',
            mac_address: 'AB:CD:EF:12:34:56',
            channel: '1',
            key: 'U1V2W3X4Y5Z6a7b8c9d0'
        }
    ];

    // 履歴データの状態
    const [history, setHistory] = useState(() => {
        // ローカルストレージから履歴を読み込む
        const savedHistory = localStorage.getItem('dppHistory');

        // 保存されたデータがあればそれを使用し、なければモックデータを使用
        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            // 履歴が空の場合のみモックデータを追加
            return parsedHistory.length > 0 ? parsedHistory : mockData;
        }

        // 保存されたデータがなければモックデータを返す
        return mockData;
    });

    // コンポーネントがマウントされた時に履歴データをローカルストレージに保存
    useEffect(() => {
        // 初回レンダリング時のみ履歴をローカルストレージに保存
        if (history.length > 0) {
            localStorage.setItem('dppHistory', JSON.stringify(history));
        }
    }, []);

    // QRコードがスキャンされたときの処理
    const handleQrDetected = (data) => {
        console.log("QR detected:", data);
        // DPP形式のデータをパース
        if (data && data.startsWith('DPP:')) {
            const parsedData = parseDppQrCode(data);
            console.log("Parsed QR data:", parsedData);

            // 既にスキャン済みのMACアドレスかチェック
            const existingDeviceIndex = scannedDevices.findIndex(
                device => device.mac_address === parsedData.mac_address
            );

            if (existingDeviceIndex >= 0) {
                // 既存のデバイス情報を更新
                const updatedDevices = [...scannedDevices];
                updatedDevices[existingDeviceIndex] = parsedData;
                setScannedDevices(updatedDevices);
            } else {
                // 新しいデバイスを追加
                setScannedDevices(prev => [...prev, parsedData]);
            }

            // エラーがあれば消去
            setError(null);
        } else {
            console.error("Invalid QR format:", data);
            setError("QRコードの形式が無効です。DPP:で始まるQRコードをスキャンしてください。");
        }
    };

    // フォームが送信されたときの処理
    const handleFormSubmit = (formData) => {
        console.log("Form submitted:", formData);

        if (scannedDevices.length === 0) {
            setError("スキャンされたデバイスがありません。先にQRコードをスキャンしてください。");
            return;
        }

        const timestamp = new Date().toISOString();
        const newHistoryEntries = [];

        // 各デバイスに同じSSIDとパスワードを設定
        scannedDevices.forEach(device => {
            const entry = {
                date: timestamp,
                ssid: formData.ssid,
                password: formData.password,
                mac_address: device.mac_address,
                channel: device.channel,
                key: device.key
            };

            newHistoryEntries.push(entry);
        });

        // 履歴に追加（最新のものが先頭に）
        const newHistory = [...newHistoryEntries, ...history].slice(0, 20); // 最新20件のみ保存
        setHistory(newHistory);

        // ローカルストレージに保存
        localStorage.setItem('dppHistory', JSON.stringify(newHistory));

        // デバイスリストをクリア
        setScannedDevices([]);
    };

    // DPP形式のQRコードをパースする関数
    const parseDppQrCode = (data) => {
        try {
            const parts = data.substring(4).split(';'); // "DPP:" を削除して分割

            let channel = '';
            let macAddress = '';
            let key = '';

            parts.forEach(part => {
                if (part.startsWith('C:')) {
                    channel = part.substring(2);
                } else if (part.startsWith('M:')) {
                    macAddress = part.substring(2);
                } else if (part.startsWith('K:')) {
                    key = part.substring(2);
                }
            });

            return {
                channel,
                mac_address: macAddress,
                key
            };
        } catch (error) {
            console.error('QRコードの解析エラー:', error);
            return null;
        }
    };

    // スキャン済みデバイスをクリアする
    const clearScannedDevices = () => {
        setScannedDevices([]);
    };

    return (
        <Layout>
            <div className="vertical-layout">
                <HistoryTable history={history} />

                <div className="scanned-devices-section">
                    <h2>Scanned Devices</h2>
                    {scannedDevices.length > 0 ? (
                        <>
                            <ul className="device-list">
                                {scannedDevices.map((device, index) => (
                                    <li key={index} className="device-item">
                                        <span>MAC: {device.mac_address}</span>
                                        <span>Channel: {device.channel}</span>
                                    </li>
                                ))}
                            </ul>
                            <button onClick={clearScannedDevices} className="clear-button">
                                Clear Scanned Devices
                            </button>
                        </>
                    ) : (
                        <p className="info-text">No Scanned Devices , Please Scan QR Code</p>
                    )}
                </div>

                <ConfigForm
                    onSubmit={handleFormSubmit}
                    disabled={scannedDevices.length === 0}
                />

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {scannedDevices.length > 0 && (
                    <div className="success-message">
                        {scannedDevices.length} devices have been scanned
                    </div>
                )}

                <QRScanner onQrDetected={handleQrDetected} />
            </div>
        </Layout>
    );
}

export default App;
