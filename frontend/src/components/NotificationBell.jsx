import React, { useState, useEffect, useRef } from 'react';
import { alertsAPI } from '../services/api';
import './NotificationBell.css';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // poll every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    async function fetchNotifications() {
        try {
            const res = await alertsAPI.getTriggered();
            const alerts = res.data?.alerts || [];
            setNotifications(alerts);
            setUnreadCount(alerts.length);
        } catch (e) { }
    }

    return (
        <div className="notification-bell-wrapper" ref={dropdownRef}>
            <button
                className={`bell-btn ${unreadCount > 0 ? 'has-alerts' : ''}`}
                onClick={() => { setIsOpen(!isOpen); setUnreadCount(0); }}
                title="Price Alerts"
            >
                🔔
                {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="bell-dropdown">
                    <div className="bell-dropdown-header">
                        <strong>🔔 Price Alerts</strong>
                        <span className="bell-count">{notifications.length}</span>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="bell-empty">No alerts triggered yet.<br />Set alerts on Mandi Rates page.</div>
                    ) : (
                        <div className="bell-list">
                            {notifications.map((n, i) => (
                                <div key={i} className="bell-item">
                                    <div className="bell-item-title">
                                        🚨 {n.commodity} went {n.condition} ₹{n.targetPrice}
                                    </div>
                                    <div className="bell-item-detail">
                                        Current: <strong>₹{n.currentPrice}/quintal</strong> at {n.market}, {n.district}
                                    </div>
                                    <div className="bell-item-time">
                                        {new Date(n.triggeredAt).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
