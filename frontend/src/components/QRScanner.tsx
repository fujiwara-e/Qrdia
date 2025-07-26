'use client';

import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';
import { ArrowButton } from '@/components/ui/Button';
import { PopupWindow } from '@/components/ui/PopupWindow';
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
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const parseDppQr = (text: string): QRData | null => {
        // DPP:C:81/6;M:48:27:e2:84:59:18;K:xxxxxx;; の形式をパース
        const channelMatch = text.match(/C:([^;]+)/);
        const macMatch = text.match(/M:([^;]+)/);
        const keyMatch = text.match(/K:([^;]+)/);
        if (channelMatch && macMatch && keyMatch) {
            return {
                channel: channelMatch[1],
                mac_address: macMatch[1],
                key: keyMatch[1],
            };
        }
        return null;
    };

    // QRコードスキャンのメインループ
    const scanFrame = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
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

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            // QRコードが検出された場合の処理
            if (lastDetectedCodeRef.current !== code.data) {
                // DPP形式のQRコードをパース
                const qrData = parseDppQr(code.data);
                if (qrData) {
                    lastDetectedCodeRef.current = code.data;
                    onQrDetected(qrData);
                } else {
                    console.error('QRコードのデータ形式が正しくありません:', code.data);
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
        setIsPopupOpen(true);
    };

    const handleStopScanning = () => {
        stopCamera();
        setIsPopupOpen(false);
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }
    };

    useEffect(() => {
        if (isPopupOpen) {
            (async () => {
                const stream = await startCamera();
                if (stream && videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })();
        } else {
            handleStopScanning();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPopupOpen]);

    useEffect(() => {
        if (status === 'scanning' && isPopupOpen) {
            requestRef.current = requestAnimationFrame(scanFrame);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [status, isPopupOpen]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <ArrowButton
                    onClick={handleStartScanning}
                    loading={status === 'starting'}
                    disabled={status === 'starting' || isPopupOpen}
                >
                    QR Scan
                </ArrowButton>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-800">
                    エラー: {error}
                </div>
            )}

            {isPopupOpen && (
                <PopupWindow onClose={handleStopScanning}>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">QR Code Preview</h2>
                            <ArrowButton onClick={handleStopScanning} >
                                Camera OFF
                            </ArrowButton>
                        </div>
                        <div className="relative overflow-hidden rounded-lg bg-gray-100 flex justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full max-w-[800px] block"
                                onLoadedMetadata={() => {
                                    if (videoRef.current) {
                                        videoRef.current.play();
                                    }
                                }}
                            />
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    </div>
                </PopupWindow>
            )}
        </div>
    );
}