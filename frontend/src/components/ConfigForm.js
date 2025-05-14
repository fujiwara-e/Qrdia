import React, { useState, useEffect } from 'react';
import '../styles/ConfigForm.css';

const ConfigForm = ({ onSubmit, disabled, loading, newDevices, devices }) => {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ssid.trim() && password.trim()) {
            onSubmit({ ssid, password });
        }
    };

    return (
        <div className="config-form-section">
            <h2>Wi-Fi Settings </h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="ssid">SSID:</label>
                    <input
                        type="text"
                        id="ssid"
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        placeholder="Enter WiFi SSID"
                        required
                        disabled={disabled || loading}
                        autoComplete='off'
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="text"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter WiFi Password"
                        required
                        disabled={disabled || loading}
                        autoComplete='off'
                    />
                </div>

                <div className="device-count-display">
                    Devices to configure: <span className="count">{devices ? devices.length : 0}</span>
                </div>

                <button
                    type="submit"
                    className={`submit-button ${disabled || loading ? 'disabled' : ''}`}
                    disabled={disabled || loading}
                >
                    {loading ? 'Configuring...' : 'Apply Configuration'}
                </button>
            </form>
        </div>
    );
};

export default ConfigForm;
