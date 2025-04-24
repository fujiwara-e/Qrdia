import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

function QRScanner({ onQrDetected }) {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const containerRef = useRef(null);

    const startScanner = async () => {
        setError(null);
        setScanning(true);

        // 少し遅延を入れてDOM要素が確実にレンダリングされるようにする
        setTimeout(() => {
            try {
                const html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;

                html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        console.log(`QR Code detected: ${decodedText}`);
                        onQrDetected(decodedText);
                        stopScanner();
                    },
                    (errorMessage) => {
                        // QRコード読み取り中のエラー（読み取りプロセスは継続）
                        console.log(`QR Code scanning error: ${errorMessage}`);
                    }
                )
                    .catch((err) => {
                        console.error(`Unable to start scanning: ${err}`);
                        setError(`スキャン開始に失敗しました: ${err.message || err}`);
                        setScanning(false);
                    });
            } catch (err) {
                console.error("Failed to start scanner:", err);
                setError(`カメラの起動に失敗しました: ${err.message || err}`);
                setScanning(false);
            }
        }, 500); // 500ms遅延
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                scannerRef.current.stop().then(() => {
                    scannerRef.current = null;
                    setScanning(false);
                }).catch(err => {
                    console.error("Error stopping scanner:", err);
                    setScanning(false);
                });
            } catch (err) {
                console.error("Error stopping scanner:", err);
                setScanning(false);
            }
        } else {
            setScanning(false);
        }
    };

    useEffect(() => {
        // コンポーネントのクリーンアップ時にスキャナーを停止
        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop();
                } catch (err) {
                    console.error("Error stopping scanner during cleanup:", err);
                }
            }
        };
    }, []);

    return (
        <div className="qr-scanner">
            <h2>QRコードスキャン</h2>

            {!scanning ? (
                <>
                    <button onClick={startScanner}>
                        QRコードスキャンを開始
                    </button>
                    {error && <div className="error-message">{error}</div>}
                </>
            ) : (
                <div className="scanner-container" ref={containerRef}>
                    {/* スキャナーエレメントを事前に作成 */}
                    <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                    <button onClick={stopScanner} className="cancel-button">
                        キャンセル
                    </button>
                </div>
            )}

            <div className="instruction">
                <p>DPP対応デバイスのQRコードをスキャンしてください</p>
                <p className="small-text">※カメラへのアクセス許可が求められたら「許可」をクリックしてください</p>
            </div>
        </div>
    );
}

export default QRScanner;
