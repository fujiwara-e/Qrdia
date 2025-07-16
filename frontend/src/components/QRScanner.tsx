'use client';

import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/Button';
import { useCamera } from '@/hooks/useCamera';
import type { QRData } from '@/lib/types';

interface QRScannerProps {
    onQrDetected: (data: QRData) => void;
}

export function QRScanner({ onQrDetected }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | null>(null);
    const lastDetectedCodeRef = useRef<string | null>(null);
    const noDetectionCountRef = useRef(0);

    const { status, error, startCamera, stopCamera } = useCamera();
    const [isScanning, setIsScanning] = useState(false);

    // QRコードスキャンのメインループ
    const scanFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
            console.log('[QRScanner] video/canvas未準備', {
                video,
                canvas,
                readyState: video?.readyState,
                videoWidth: video?.videoWidth,
                videoHeight: video?.videoHeight
            });
            requestRef.current = requestAnimationFrame(scanFrame);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.log('[QRScanner] ctx取得失敗');
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        console.log('[QRScanner] drawImage後 canvasサイズ:', canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log('[QRScanner] imageData:', imageData);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        console.log('[QRScanner] jsQR result:', code);

        if (code) {
            // QRコードが検出された場合の処理
            if (lastDetectedCodeRef.current !== code.data) {
                try {
                    console.log('[QRScanner] QRコード検出:', code.data);
                    const qrData: QRData = JSON.parse(code.data);
                    if (qrData.mac_address && qrData.channel && qrData.key) {
                        lastDetectedCodeRef.current = code.data;
                        onQrDetected(qrData);
                    }
                } catch (error) {
                    console.error('QRコードの解析に失敗:', error);
                }
            }
            noDetectionCountRef.current = 0;
        } else {
            noDetectionCountRef.current++;
            if (noDetectionCountRef.current > 60) {
                lastDetectedCodeRef.current = null;
                noDetectionCountRef.current = 0;
            }
        }

        requestRef.current = requestAnimationFrame(scanFrame);
    };

    const handleStartScanning = async () => {
        const stream = await startCamera();
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsScanning(true);
        }
    };

    const handleStopScanning = () => {
        stopCamera();
        setIsScanning(false);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
    };

    useEffect(() => {
        if (status === 'scanning' && isScanning) {
            requestRef.current = requestAnimationFrame(scanFrame);
        }

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [status, isScanning]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">QR Code Scanner</h2>
                {isScanning ? (
                    <Button onClick={handleStopScanning} variant="danger">
                        スキャン停止
                    </Button>
                ) : (
                    <Button
                        onClick={handleStartScanning}
                        loading={status === 'starting'}
                        disabled={status === 'starting'}
                    >
                        スキャン開始
                    </Button>
                )}
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-800">
                    エラー: {error}
                </div>
            )}

            <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full max-w-md ${isScanning ? 'block' : 'hidden'}`}
                    onLoadedMetadata={() => {
                        if (videoRef.current) {
                            videoRef.current.play();
                        }
                    }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {!isScanning && (
                    <div className="flex h-64 items-center justify-center">
                        <p className="text-gray-500">カメラを開始してQRコードをスキャンしてください</p>
                    </div>
                )}
            </div>
        </div>
    );
}