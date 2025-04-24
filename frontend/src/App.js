import React, { useState, useEffect } from 'react';
import './App.css';
import ConfigForm from './components/ConfigForm';
import HistoryTable from './components/HistoryTable';
import QRScanner from './components/QRScanner';
import Layout from './components/Layout';

function App() {
    // QRスキャン結果の状態
    const [qrData, setQrData] = useState(null);

    // 履歴データの状態
    const [history, setHistory] = useState(() => {
        // ローカルストレージから履歴を読み込む
        const savedHistory = localStorage.getItem('dppHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    });

    // QRコードがスキャンされたときの処理
    const handleQrDetected = (data) => {
        console.log("QR detected:", data);
        // DPP形式のデータをパース
        if (data && data.startsWith('DPP:')) {
            const parsedData = parseDppQrCode(data);
            console.log("Parsed QR data:", parsedData);
            setQrData(parsedData);
        } else {
            console.error("Invalid QR format:", data);
            alert("QRコードの形式が無効です。DPP:で始まるQRコードをスキャンしてください。");
        }
    };

    // フォームが送信されたときの処理
    const handleFormSubmit = (formData) => {
        console.log("Form submitted:", formData);

        // 履歴エントリを作成
        const entry = {
            date: new Date().toISOString(),
            ...formData
        };

        // 履歴に追加（最新のものが先頭に）
        const newHistory = [entry, ...history].slice(0, 10); // 最新10件のみ保存
        setHistory(newHistory);

        // ローカルストレージに保存
        localStorage.setItem('dppHistory', JSON.stringify(newHistory));
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

    return (
        <Layout>
            <div className="vertical-layout">
                <ConfigForm
                    onSubmit={handleFormSubmit}
                    disabled={!qrData}
                    qrData={qrData}
                />

                {qrData && (
                    <div className="qr-status success">
                        QRコードを検出しました。MACアドレス: {qrData.mac_address}
                    </div>
                )}

                <HistoryTable history={history} />

                <QRScanner onQrDetected={handleQrDetected} />
            </div>
        </Layout>
    );
}

export default App;
