import React from 'react';

function HistoryTable({ history }) {
    if (!history || history.length === 0) {
        return (
            <div className="history">
                <h2>Setting Information</h2>
                <p>No Infomation</p>
            </div>
        );
    }

    // 日付を24時間表記でフォーマットする関数
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    };

    // キーの表示を短縮する関数
    const formatKey = (key) => {
        if (!key) return '';
        return key.substring(0, 5) + '...';
    };

    return (
        <div className="history">
            <h2>Setting Information</h2>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>SSID</th>
                        <th>Password</th>
                        <th>MAC Address</th>
                        <th>channel</th>
                        <th>Key</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item, index) => (
                        <tr key={index}>
                            <td>{formatDate(item.date)}</td>
                            <td>{item.ssid}</td>
                            <td>{item.password}</td>
                            <td>{item.mac_address}</td>
                            <td>{item.channel}</td>
                            <td>{formatKey(item.key)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default HistoryTable;
