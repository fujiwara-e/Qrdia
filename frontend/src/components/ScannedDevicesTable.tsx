import { useState } from "react";
import type { WiFiConfig, Device } from "@/lib/types";
import { SectionTitle } from "./ui/SectionTitle";
import { Button } from "./shadcn/ui/button";
import { X, Wifi } from 'lucide-react';

type Props = {
    devices: Device[];
    config: WiFiConfig;
    onConfigApplied: (mac_address: string) => Promise<void>;
    onApplyAll: () => Promise<void>;
    isApplyingAll: boolean;
};

export function ScannedDevicesTable({ devices, config, onConfigApplied, onApplyAll, isApplyingAll }: Props) {
    const [configuring, setConfiguring] = useState<string[]>([]);

    const handleApplySingle = async (mac_address: string) => {
        setConfiguring(prev => [...prev, mac_address]);
        try {
            await onConfigApplied(mac_address);
        } catch (error) {
            console.error('Configuration failed:', error);
        } finally {
            setConfiguring(prev => prev.filter(m => m !== mac_address));
        }
    };

    return (
        <div className="rounded-lg bg-white p-5 shadow-md">
            <SectionTitle>Scanned Devices</SectionTitle>
            {(devices.length === 0) ?
                <p className="text-gray-500">No Scanned Devices</p> :
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-100">
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">MAC</th>
                                    <th className="px-1 py-2 text-left text-sm font-medium text-gray-700">Channel</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Key</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((d, i) => (
                                    <tr key={i} className={`border-b border-gray-200 transition-colors hover:bg-gray-50 ${d.status === 'configured' ? 'opacity-50' : ''}`}>
                                        <td className="px-2 py-2 text-sm text-gray-600 font-mono">
                                            {d.status === 'configured' ? (
                                                <Wifi className="ml-3 h-4 w-4 text-green-500" />
                                            ) : d.status === 'error' ? (
                                                <X className="ml-3 h-4 w-4 text-red-500" />
                                            ) : (
                                                d.status
                                            )}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600 font-mono">{d.mac_address}</td>
                                        <td className="px-2 py-2 text-sm text-gray-600">{d.channel}</td>
                                        <td className="px-2 py-2 text-sm text-gray-600">
                                            {d.key.length > 10
                                                ? `${d.key.slice(0, 20)}...${d.key.slice(-20)}`
                                                : d.key}
                                        </td>
                                        <td className="px-2 py-2 text-sm text-gray-600">
                                            <Button
                                                className="px-0"
                                                onClick={() => handleApplySingle(d.mac_address)}
                                                disabled={isApplyingAll || configuring.includes(d.mac_address) || d.status === 'configured'}
                                                variant="link"
                                            >
                                                {configuring.includes(d.mac_address) ? 'Applying...' :
                                                    d.status === 'configured' ? 'Applied' : 'Apply'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            onClick={onApplyAll}
                            disabled={isApplyingAll || devices.length === 0 || devices.every(d => d.status === 'configured')}
                        >
                            {isApplyingAll ? "Applying..." : "Apply All"}
                        </Button>
                    </div>
                </div>
            }
        </div>
    )
}