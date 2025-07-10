'use Client';

import { useState, useRef, useCallback } from "react";
import type { CameraStatus } from "@/lib/types";

export function useCamera() {
    const [status, setStatus] = useState<CameraStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = useCallback(async (): Promise<MediaStream | null> => {
        try {
            setError(null);
            setStatus('starting');

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            setStatus('scanning');
            return stream;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
            setError(errorMessage);
            setStatus('error');
            return null;
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setStatus('idle');
        setError(null);
    }, []);

    return {
        status,
        error,
        startCamera,
        stopCamera,
    };
}
