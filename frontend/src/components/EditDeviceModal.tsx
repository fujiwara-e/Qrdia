'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './shadcn/ui/button';
import { Input } from './ui/Input';
import { PopupWindow } from './ui/PopupWindow';
import type { Device } from '@/lib/types';

interface EditDeviceModalProps {
  device: Device | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: Device) => void;
}

export function EditDeviceModal({ device, isOpen, onClose, onSave }: EditDeviceModalProps) {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState<'scanned' | 'configuring' | 'configured' | 'error'>('scanned');

  useEffect(() => {
    if (device) {
      setName(device.name || '');
      setRoom(device.room || '');
      setDesc(device.desc || '');
      setStatus(device.status || 'scanned');
    }
  }, [device]);

  const handleSave = () => {
    if (device) {
      onSave({ ...device, name, room, desc, status });
      onClose();
    }
  };

  if (!isOpen || !device) {
    return null;
  }

  return (
    <PopupWindow
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Device: ${device.id}`}
      position="center"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="room" className="block text-sm font-medium text-gray-700">
            Room
          </label>
          <Input
            id="room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <Input
            id="desc"
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'scanned' | 'configuring' | 'configured' | 'error')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="scanned">Scanned</option>
            <option value="configuring">Configuring</option>
            <option value="configured">Configured</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="link">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="link">Save</Button>
        </div>
      </div>
    </PopupWindow>
  );
}
