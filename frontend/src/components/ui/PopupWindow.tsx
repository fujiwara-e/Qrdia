import React, { ReactNode, MouseEvent } from 'react';

interface PopupWindowProps {
    children: ReactNode;
    onClose?: () => void;
}

export function PopupWindow({ children, onClose }: PopupWindowProps) {
    // 背景クリック時にonCloseを呼ぶ
    const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };
    return (
        <div
            className="fixed inset-0 bg-opacity-20 flex items-end justify-center z-100"
            onClick={handleBackgroundClick}
        >
            <div
                className="bg-white p-6 rounded shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
