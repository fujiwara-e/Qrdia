import type { QRData } from "@/lib/types"
import { SectionTitle } from "./ui/SectionTitle";

export function ScannedDevicesTable(
    { devices }: { devices: QRData[] }) {
    if (devices.length === 0) {
        return <p className="text-gray-500">No Scanned Devices</p>;
    }
    return (

        <div className="rounded-lg bg-white p-6 shadow-md">
            <SectionTitle>Scanned Devices</SectionTitle>
            <table className="w-full border rounded mb-2">
                <thead>
                    <tr>
                        <th>MAC</th>
                        <th>Channel</th>
                        <th>Key</th>
                    </tr>
                </thead>
                <tbody>
                    {devices.map((d, i) => (
                        <tr key={i}>
                            <td>{d.mac_address}</td>
                            <td>{d.channel}</td>
                            <td>{d.key}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
