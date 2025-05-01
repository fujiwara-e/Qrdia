import React from 'react';
import '../styles/HistoryTable.css';

const HistoryTable = ({ history, newDevices }) => {
    const hasNewDevices = newDevices && newDevices.length > 0;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('default', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    };

    return (
        <div className={`history-table-section ${hasNewDevices ? 'setting-info-highlight' : ''}`}>
            <h2>Setting Information</h2>

            {hasNewDevices && (
                <div className="new-device-notification">
                    <span className="notification-icon">📌</span>
                    <span className="notification-text">New device ready for configuration</span>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>SSID</th>
                            <th>Password</th>
                            <th>MAC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((item, index) => (
                            <tr key={index}>
                                <td>{formatDate(item.date)}</td>
                                <td>{item.ssid}</td>
                                <td>{item.password}</td>
                                <td>{item.mac_address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoryTable;
