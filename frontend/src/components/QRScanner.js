import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';

function QRScanner({ onQrDetected }) {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const scanStartedRef = useRef(false);
    const lastDetectedCodeRef = useRef(null); // 最後に検出したコードを保存
    const noDetectionCountRef = useRef(0); // 検出されないフレームのカウント

    // カメラストリームの開始
    const startCamera = async () => {
        try {
            setError(null);
            setScanning(true);
            console.log("[Camera] Starting...");

            // スキャンが既に開始されている場合はリセット
            if (scanStartedRef.current) {
                resetCamera();
            }

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("[Camera] Stream obtained");

            // videoRef.currentが有効か確認
            if (!videoRef.current) {
                console.error("[Camera] Video reference is not available");
                setError("ビデオ要素が見つかりませんでした");
                setScanning(false);
                return;
            }

            // キャンバスが有効か確認
            if (!canvasRef.current) {
                console.error("[Camera] Canvas reference is not available");
                setError("キャンバス要素が見つかりませんでした");
                setScanning(false);
                return;
            }

            videoRef.current.srcObject = stream;

            // ビデオの画質を向上させる設定
            if (videoRef.current.videoWidth) {
                // 低遅延設定
                videoRef.current.playbackRate = 1.0;
            }

            // ビデオの準備完了を待つ
            videoRef.current.onloadedmetadata = function () {
                console.log("[Video] Metadata loaded, dimensions:", videoRef.current.videoWidth, "x", videoRef.current.videoHeight);

                // ビデオの再生を開始
                videoRef.current.play().then(() => {
                    console.log("[Video] Playing, starting scan");
                    scanStartedRef.current = true;
                    lastDetectedCodeRef.current = null; // コード検出履歴をリセット
                    noDetectionCountRef.current = 0;

                    // 少し遅延を入れてからスキャンを開始
                    setTimeout(() => {
                        scanFrame();
                    }, 300);
                }).catch(err => {
                    console.error("[Video] Play failed:", err);
                    setError(`ビデオの再生に失敗しました: ${err.message}`);
                    setScanning(false);
                });
            };

        } catch (err) {
            console.error("[Camera] Failed to start:", err);
            setError(`カメラの起動に失敗しました: ${err.message}`);
            setScanning(false);
        }
    };

    // カメラストリームの完全停止
    const stopCamera = () => {
        scanStartedRef.current = false;

        if (requestRef.current) {
            console.log("[Camera] Canceling animation frame");
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        if (videoRef.current && videoRef.current.srcObject) {
            console.log("[Camera] Stopping media tracks");
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => {
                track.stop();
            });
            videoRef.current.srcObject = null;
        }

        setScanning(false);
    };

    // カメラストリームはそのままで、スキャン処理をリセット
    const resetCamera = () => {
        if (requestRef.current) {
            console.log("[Camera] Canceling animation frame");
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
        scanStartedRef.current = false;
        lastDetectedCodeRef.current = null;
        noDetectionCountRef.current = 0;
    };

    // フレームの処理とQRコードの検出
    const scanFrame = () => {
        if (!scanStartedRef.current) {
            console.log("[Scan] Scan process stopped");
            return;
        }

        // ビデオとキャンバスの参照が有効か確認
        if (!videoRef.current || !canvasRef.current) {
            console.error("[Scan] Video or canvas reference is missing");
            return;
        }

        // ビデオが再生中か確認
        if (videoRef.current.paused || videoRef.current.ended || videoRef.current.readyState < 2) {
            console.log("[Scan] Video is not ready yet, waiting...");
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // ビデオのサイズを確認
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.log("[Scan] Video dimensions not available yet, waiting...");
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        // ビデオフレームのサイズをキャンバスに設定
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // フレームをキャンバスに描画（クリアしてから描画）
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        try {
            // キャンバスから画像データを取得
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // キャンバスは非表示
            canvas.style.display = 'none';

            // QRコードスキャン直接実行
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                // DPP形式かチェック
                if (code.data.startsWith('DPP:')) {
                    // 前回と異なるQRコード、または一定回数検出されなかった後の再検出の場合
                    if (lastDetectedCodeRef.current !== code.data || noDetectionCountRef.current >= 30) {
                        console.log("[QR] Detected new DPP QR code:", code.data);

                        // QRコード領域をマーキング
                        ctx.lineWidth = 5;
                        ctx.strokeStyle = '#00FF00';
                        ctx.beginPath();
                        ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                        ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                        ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                        ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                        ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                        ctx.stroke();

                        // 最後に検出したコードを更新
                        lastDetectedCodeRef.current = code.data;
                        noDetectionCountRef.current = 0;

                        // QRコードのデータを処理（親コンポーネントに通知）
                        onQrDetected(code.data);
                    }
                } else {
                    console.log("[QR] Non-DPP QR code detected:", code.data);
                    noDetectionCountRef.current++;
                }
            } else {
                // QRコードが検出されなかった場合はカウントを増やす
                noDetectionCountRef.current++;
            }

            // スキャン継続
            requestRef.current = requestAnimationFrame(scanFrame);

        } catch (err) {
            console.error("[Scan] Error processing frame:", err);
            requestRef.current = requestAnimationFrame(scanFrame);
        }
    };

    // コンポーネントがアンマウントされた時にカメラを停止
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="qr-scanner">
            <h2>QR Code Scan</h2>

            {!scanning ? (
                <>
                    <button onClick={startCamera} className="start-button">
                        Start QR code scan
                    </button>

                    {error && <div className="error-message">{error}</div>}
                </>
            ) : (
                <div className="scanner-container">
                    <div className="video-container">
                        <video
                            ref={videoRef}
                            className="scanner-video"
                            playsInline
                            muted
                            autoPlay
                        ></video>
                        <canvas
                            ref={canvasRef}
                            className="scanner-canvas"
                        ></canvas>
                    </div>
                    <div className="scanner-controls">
                        <button onClick={stopCamera} className="cancel-button">
                            カメラを停止
                        </button>
                    </div>
                </div>
            )}

            <div className="instruction">
                <p>Scan the QR code for DPP-enabled devices</p>
                <p className="small-text">*Click “Allow” when asked for permission to access the camera.</p>
            </div>
        </div>
    );
}

export default QRScanner;
