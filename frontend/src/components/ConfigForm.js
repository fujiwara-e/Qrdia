import React, { useState } from 'react';
import axios from 'axios';

function ConfigForm({ onSubmit, disabled }) {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);

    // 入力フィールドの変更ハンドラを明示的に定義
    const handleSsidChange = (e) => {
        setSsid(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;

        setLoading(true);
        setStatus(null);

        try {
            // フォームデータを作成
            const formData = {
                ssid,
                password
            };

            console.log("送信データ:", formData);

            // 親コンポーネントに通知
            onSubmit(formData);

            setStatus({
                type: 'success',
                message: '設定が正常に適用されました'
            });

            // フォームをリセット
            setSsid('');
            setPassword('');
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus({
                type: 'error',
                message: '設定の適用に失敗しました'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="config-form">
            <h2>Wi-Fi Settings</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="ssid">SSID:</label>
                        <input
                            type="text"
                            id="ssid"
                            value={ssid}
                            onChange={handleSsidChange}
                            disabled={disabled || loading}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                            disabled={disabled || loading}
                            required
                        />
                    </div>
                </div>
                <button type="submit" disabled={disabled || loading} className="submit-button">
                    {loading ? 'Processing...' : 'Apply settings to all devices'}
                </button>

                {status && (
                    <div className={`status ${status.type}`}>
                        {status.message}
                    </div>
                )}

                {disabled && (
                    <p className="info-text">To start seting up, first scan the QR code</p>
                )}
            </form>
        </div>
    );
}

export default ConfigForm;
