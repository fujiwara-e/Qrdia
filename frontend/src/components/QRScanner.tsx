
'use client';

import React, { useState, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ArrowButton } from '@/components/ui/Button';
import { Button } from '@/components/shadcn/ui/button';
import { PopupWindow } from '@/components/ui/PopupWindow';
import { QrCode } from 'lucide-react';
import type { QRData } from '@/lib/types';

interface QRScannerProps {
    onQrDetected: (data: QRData) => void;
}

export function QRScanner({ onQrDetected }: QRScannerProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastDetectedCodeRef = useRef<string | null>(null);
    const scannerRef = useRef<HTMLDivElement>(null);

    const parseDppQr = (text: string): QRData | null => {
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

    const handleScan = (detectedCodes: any) => {
        if (detectedCodes && detectedCodes.length > 0) {
            const code = detectedCodes[0].rawValue;
            if (lastDetectedCodeRef.current !== code) {
                const qrData = parseDppQr(code);
                if (qrData) {
                    lastDetectedCodeRef.current = code;
                    onQrDetected(qrData);

                    // Add flash effect
                    if (scannerRef.current) {
                        scannerRef.current.classList.add('flash');
                        setTimeout(() => {
                            if (scannerRef.current) {
                                scannerRef.current.classList.remove('flash');
                            }
                        }, 500);
                    }
                }
            }
        }
    };

    const handleError = (error: any) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to start camera';
        setError(errorMessage);
    };

    const handleStartScanning = () => {
        setIsPopupOpen(true);
        setError(null);
        lastDetectedCodeRef.current = null;
    };



    const handleStopScanning = () => {
        setIsPopupOpen(false);
    };

    return (
        <div className="space-y-2">
            <Button
                variant="default"
                size="icon"
                className='fixed bottom-6 right-6 p-8 rounded-full hover:bg-neutral-400 '
                onClick={handleStartScanning}
                disabled={isPopupOpen}
            >
                <QrCode className='w-9 h-9' />
            </Button>

            {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-800">
                    エラー: {error}
                </div>
            )}

            <PopupWindow isOpen={isPopupOpen} onClose={handleStopScanning} position="bottom">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">QR Code Preview</h2>
                        <ArrowButton onClick={handleStopScanning} >
                            Camera OFF
                        </ArrowButton>
                    </div>
                    <div ref={scannerRef} className="relative rounded-lg bg-gray-100 flex justify-center w-full max-w-lg mx-auto">
                        {isPopupOpen && (
                            <Scanner
                                onScan={handleScan}
                                onError={handleError}
                                constraints={{
                                    facingMode: 'environment',
                                    width: { ideal: 1280 },
                                    height: { ideal: 720 }
                                }}
                                allowMultiple={true}
                                scanDelay={500}
                                sound={false}
                            />
                        )}
                    </div>
                </div>
            </PopupWindow>
        </div>
    );
}
