import React, { ReactNode, MouseEvent } from 'react';

interface PopupWindowProps {
    children: ReactNode;
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    position?: 'center' | 'bottom';
}

export function PopupWindow({ children, isOpen, onClose, title, position = 'bottom' }: PopupWindowProps) {
    if (!isOpen) return null;

    const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    const positionClasses = {
        center: 'items-center w-full mx-4',
        bottom: 'items-end',
    };

    return (
        <div
            className={`fixed inset-0 bg-opacity-20 flex justify-center ${positionClasses[position]}`}
            onClick={handleBackgroundClick}
        >
            <div
                className="bg-white p-6 rounded-lg shadow-xl " // Added max-w-md and mx-4 for better presentation
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <h2 className="text-lg font-semibold mb-4">{title}</h2>
                )}
                {children}
            </div>
        </div>
    );
}
