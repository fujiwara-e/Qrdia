'use client';
import React, { useState, useEffect } from 'react';
import { DemoManager } from '@/lib/demo';

interface DemoToggleProps {
    onModeChange?: (isDemoMode: boolean) => void;
}

export function DemoToggle({ onModeChange }: DemoToggleProps) {
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setIsDemoMode(DemoManager.isDemoMode());
    }, []);

    const handleToggle = () => {
        const newMode = !isDemoMode;
        setIsDemoMode(newMode);
        DemoManager.setDemoMode(newMode);

        if (newMode) {
            // デモモードに切り替える際、サンプルデータを初期化
            DemoManager.initializeDemoData();
        }

        if (onModeChange) {
            onModeChange(newMode);
        }

        // ページをリロードして状態をリセット
        window.location.reload();
    };

    if (!isClient) {
        return null; // SSR時は何も表示しない
    }

    return (
        <div className="flex items-center gap-3">
            {/* トグルスイッチ */}
            <label className="flex select-none items-center cursor-pointer">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={isDemoMode}
                        onChange={handleToggle}
                        className="sr-only"
                    />
                    <div
                        className={`box block h-6 w-11 rounded-full transition-colors ${isDemoMode ? 'bg-black' : 'bg-gray-300'
                            }`}
                    ></div>
                    <div
                        className={`absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition-transform ${isDemoMode ? 'translate-x-full' : ''
                            }`}
                    ></div>
                </div>
            </label>

            {/* ラベル */}
            <span className="text-sm text-gray-700">
                {isDemoMode ? 'デモモード' : ''}
            </span>
        </div>
    );
}
