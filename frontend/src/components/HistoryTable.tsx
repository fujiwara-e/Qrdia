'use client';

import React, { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import type { Device } from '@/lib/types';

interface HistoryTableProps {
    history: Device[];
    newDevices?: Device[];
}

export function HistoryTable({ history, newDevices = [] }: HistoryTableProps) {
    const hasNewDevices = newDevices.length > 0;
    const [newItems, setNewItems] = useState<Device[]>([]);

    useEffect(() => {
        if (history.length > 0) {
            const latestItem = history[0];
            setNewItems([latestItem]);

            const timer = setTimeout(() => {
                setNewItems([]);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [history.length]);

    const isNewItem = (item: Device) => {
        return newItems.some(newItem =>
            newItem.date === item.date && newItem.mac_address === item.mac_address
        );
    };

    return (
        <div className={`
      rounded-lg bg-gray-50 p-5 shadow-md transition-all duration-300
      ${hasNewDevices
                ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-300/30 animate-pulse-soft'
                : ''
            }
    `}>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Setting Information</h2>

            {hasNewDevices && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-green-50 p-3 animate-slide-in">
                    <span className="text-lg">📌</span>
                    <span className="text-sm font-medium text-green-800">
                        New device ready for configuration
                    </span>
                </div>
            )}

            {history.length === 0 ? (
                <p className="text-center text-gray-500">No configuration history</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">SSID</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">MAC Address</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Channel</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, index) => (
                                <tr
                                    key={`${item.date}-${item.mac_address}`}
                                    className={`
                    border-b border-gray-200 transition-colors hover:bg-gray-50
                    ${isNewItem(item) ? 'bg-yellow-50 animate-fade-in' : ''}
                  `}
                                >
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        {formatDate(item.date)}
                                    </td>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                        {item.ssid}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600 font-mono">
                                        {item.mac_address}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-600">
                                        {item.channel}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}