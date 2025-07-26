import type { Device } from "@/lib/types";
import { SectionTitle } from "./ui/SectionTitle";
import { Button } from "./ui/Button";

type Props = {
  devices: Device[];
  onApplyConfig: (mac_address: string) => void;
};

export function ScannedDevicesTable(
    { devices, onApplyConfig }: Props) {
    if (devices.length === 0) {
        return <p className="text-gray-500">No Scanned Devices</p>;
    }
    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <SectionTitle>Scanned Devices</SectionTitle>
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
                                        onClick={() => onApplyConfig(d.mac_address)}
                                        disabled={d.status === 'configuring' || d.status === 'configured'}
                                        variant={d.status === 'configured' ? 'secondary' : 'primary'}
                                    >
                                        {d.status === 'configuring'
                                            ? '適用中...'
                                            : d.status === 'configured'
                                            ? '適用済み'
                                            : '適用'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
