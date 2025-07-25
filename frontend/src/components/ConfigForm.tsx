'use client';

import React, { useState } from 'react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { Button } from '@/components/ui/Button';
import { SectionTitle } from './ui/SectionTitle';
import { Input } from '@/components/ui/Input';
import type { WiFiConfig, Device } from '@/lib/types';

interface ConfigFormProps {
    onSubmit: (config: WiFiConfig) => void;
    disabled?: boolean;
    loading?: boolean;
    devices?: Device[];
}

export function ConfigForm({ onSubmit, disabled = false, loading = false, devices = [] }: ConfigFormProps) {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ssid.trim && password.trim()) {
            onSubmit({ ssid, password });
        }
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <SectionTitle>DPP Provisioning</SectionTitle>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 ">SSID</label>
                    <Input
                        id="ssid"
                        type="text"
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        placeholder='Enter WiFi SSID'
                        required
                        disabled={disabled || loading}
                        autoComplete="off"
                        className='mt-1'
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <Input
                        id="password"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter WiFi Password'
                        required
                        disabled={disabled || loading}
                        autoComplete="off"
                        className='mt-1'
                    />
                </div>
                <SectionTitle>Matter Provisioning</SectionTitle>

                <div className="items-center space-x-3">
                    <span className="text-sm text-gray-700">Commisioning (For Matter)</span>
                    <ToggleSwitch disabled={disabled || loading} />
                </div>


                <div className="rounded-md bg-blue-50 p-3">
                    <span className="text-sm text-blue-800">
                        Device to configure: <span className="font-semibold">{devices.length}</span>
                    </span>
                </div>

                <Button
                    type="submit"
                    size="md"
                    loading={loading}
                    disabled={disabled || loading || !ssid.trim() || !password.trim()}
                    className="w-full"
                >
                    {loading ? 'Configuring...' : 'Configure Devices'}
                </Button>
            </form>
        </div>
    );

}