import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ConfigForm({ onSubmit, disabled, qrData }) {
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
            // QRデータと組み合わせたデータを作成
            const formData = {
                ...qrData,
                ssid,
                password
            };

            console.log("送信データ:", formData);

            // 親コンポーネントに通知
            onSubmit(formData);

            // バックエンドAPIにリクエストを送信
            const response = await axios.post('http://localhost:5000/api/configure', formData);

            setStatus({
                type: 'success',
                message: response.data.message || '設定が正常に適用されました'
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'エラーが発生しました'
            });
        } finally {
            setLoading(false);
        }
    };

    // QRデータが変更されたときにフォームフィールドを有効にする
    useEffect(() => {
        console.log("QR Data updated:", qrData);
    }, [qrData]);

    return (
        <div className="config-form">
            <h2>Wi-Fi設定</h2>
            <form onSubmit={handleSubmit}>
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
                    <label htmlFor="password">パスワード:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={disabled || loading}
                        required
                    />
                </div>
                <button type="submit" disabled={disabled || loading}>
                    {loading ? '処理中...' : '設定を適用'}
                </button>

                {status && (
                    <div className={`status ${status.type}`}>
                        {status.message}
                    </div>
                )}

                {disabled && (
                    <p className="info-text">設定を開始するには、まずQRコードをスキャンしてください。</p>
                )}
            </form>
        </div>
    );
}

export default ConfigForm;
