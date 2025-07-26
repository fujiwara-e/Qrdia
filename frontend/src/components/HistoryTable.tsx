'use client';

import React, { useState, useEffect } from 'react';
import { SectionTitle } from './ui/SectionTitle';
import type { Device } from '@/lib/types';
import { EditDeviceModal } from './EditDeviceModal';
import { Button } from './ui/Button';

interface HistoryTableProps {
    history: Device[];
    newDevices?: Device[];
    onSave: (device: Device) => void;
}

export function HistoryTable({ history, newDevices = [], onSave }: HistoryTableProps) {
    const hasNewDevices = newDevices.length > 0;
    const [newItems, setNewItems] = useState<Device[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);

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

    const handleEditClick = (device: Device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDevice(null);
    };

    const handleSaveDevice = (device: Device) => {
        onSave(device);
        handleCloseModal();
    };

    const isNewItem = (item: Device) => {
        return newItems.some(newItem =>
            newItem.date === item.date && newItem.mac_address === item.mac_address
        );
    };

    return (
        <>
            <div className={`
      rounded-lg bg-gray-50 p-5 shadow-md transition-all duration-300
      ${hasNewDevices
                ? 'border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 shadow-blue-300/30 animate-pulse-soft'
                : ''
            }
    `}>
                <SectionTitle>Setting Information</SectionTitle>

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
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Room</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Desc</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item) => (
                                    <tr
                                        key={`${item.date}-${item.mac_address}`}
                                        className={`
                    border-b border-gray-200 transition-colors hover:bg-gray-50
                    ${isNewItem(item) ? 'bg-yellow-50 animate-fade-in' : ''}
                  `}
                                    >
                                        <td className="px-2 py-2 text-sm text-gray-600">
                                            {item.status}
                                        </td>
                                        <td className="px-2 py-2 text-sm font-medium text-gray-900">
                                            {item.id}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600 font-mono">
                                            {item.name}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600">
                                            {item.room}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600">
                                            {item.desc}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600">
                                            <Button onClick={() => handleEditClick(item)} size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <EditDeviceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveDevice}
                device={editingDevice}
            />
        </>
    );
}