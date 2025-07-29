import { useState } from "react";
import type { WiFiConfig, Device } from "@/lib/types";
import { SectionTitle } from "./ui/SectionTitle";
import { Button } from "./shadcn/ui/button";

type Props = {
    devices: Device[];
    config: WiFiConfig;
    onConfigApplied: (mac_address: string) => void;
    onApplyAll: () => void;
    isApplyingAll: boolean;
};

export function ScannedDevicesTable({ devices, config, onConfigApplied, onApplyAll, isApplyingAll }: Props) {
    const [configuring, setConfiguring] = useState<string[]>([]);

    const handleApplySingle = async (mac_address: string) => {
        setConfiguring(prev => [...prev, mac_address]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        onConfigApplied(mac_address);
        setConfiguring(prev => prev.filter(m => m !== mac_address));
    };

    // if (devices.length === 0) {
    //     return <p className="text-gray-500">No Scanned Devices</p>;
    // }

    return (
        <div className="rounded-lg bg-gray-50 p-5 shadow-md">
            <SectionTitle>Scanned Devices</SectionTitle>
            {(devices.length === 0) ?
                <p className="text-gray-500">No Scanned Devices</p> :
                <div>
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-100">
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700 whitespace-nowrap">MAC</th>
                                    <th className="px-1 py-2 text-left text-sm font-medium text-gray-700">Channel</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Key</th>
                                    <th className="px-2 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((d, i) => (
                                    <tr key={i} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                                        <td className="px-2 py-2 text-sm text-gray-600 font-mono whitespace-nowrap">{d.mac_address}</td>
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
                                                disabled={isApplyingAll || configuring.includes(d.mac_address)}
                                                variant="link"
                                            >
                                                {configuring.includes(d.mac_address) ? 'Applying...' : 'Apply'}
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
                            disabled={isApplyingAll || devices.length === 0}
                        >
                            {isApplyingAll ? "Applying..." : "Apply All"}
                        </Button>
                    </div>
                </div>
            }
        </div>
    )
}