'use client';

import React from 'react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { SectionTitle } from './ui/SectionTitle';
import { Input } from '@/components/ui/Input';
import type { WiFiConfig, Device } from '@/lib/types';

interface ConfigFormProps {
    config: WiFiConfig;
    onConfigChange: (config: WiFiConfig) => void;
    disabled?: boolean;
    loading?: boolean;
    devices?: Device[];
}

export function ConfigForm({ config, onConfigChange, disabled = false, loading = false, devices = [] }: ConfigFormProps) {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onConfigChange({
            ...config,
            [e.target.id]: e.target.value
        });
    };

    return (
        <div className="rounded-lg bg-white p-6 shadow-md">
            <SectionTitle>DPP Provisioning</SectionTitle>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 ">SSID</label>
                    <Input
                        id="ssid"
                        type="text"
                        value={config.ssid}
                        onChange={handleChange}
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
                        value={config.password}
                        onChange={handleChange}
                        placeholder='Enter WiFi Password'
                        required
                        disabled={disabled || loading}
                        autoComplete="off"
                        className='mt-1'
                    />
                </div>
                <SectionTitle>Matter Provisioning</SectionTitle>
                <div className="items-center space-x-3">
                    <span className="text-sm text-gray-700">Commisioning</span>
                    <ToggleSwitch disabled={disabled || loading} />
                </div>
            </div>
        </div>
    );

}