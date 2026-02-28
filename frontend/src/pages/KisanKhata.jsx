import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ledgerAPI } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './KisanKhata.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function KisanKhata() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, byCategory: {} });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('expense');
    const [formData, setFormData] = useState({
        amount: '',
        category: 'other',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(true);

    const categories = {
        expense: ['labor', 'seeds', 'diesel', 'fertilizers', 'equipment_rent', 'pesticides', 'transport', 'other'],
        income: ['crop_sale', 'subsidy', 'equipment_rent_out', 'other']
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [entriesRes, statsRes] = await Promise.all([
                ledgerAPI.getEntries(),
                ledgerAPI.getStats()
            ]);
            setEntries(entriesRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error fetching ledger data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type) => {
        setModalType(type);
        setFormData({ amount: '', category: categories[type][0], description: '', date: new Date().toISOString().split('T')[0] });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ledgerAPI.addEntry({ ...formData, type: modalType, amount: parseFloat(formData.amount) });
            setShowModal(false);
            fetchData();
        } catch (err) {
            console.error('Error adding entry:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return;
        try {
            await ledgerAPI.deleteEntry(id);
            fetchData();
        } catch (err) {
            console.error('Error deleting:', err);
        }
    };

    const doughnutData = {
        labels: [t('ledger.income'), t('ledger.expense')],
        datasets: [{ data: [stats.totalIncome, stats.totalExpense], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0 }]
    };

    const barData = {
        labels: Object.keys(stats.byCategory).map(c => c.replace(/_/g, ' ')),
        datasets: [{ label: t('ledger.amount'), data: Object.values(stats.byCategory), backgroundColor: '#3b82f6', borderRadius: 8 }]
    };

    const netProfit = stats.totalIncome - stats.totalExpense;

    if (loading) return <div className="loading">{t('common.loading')}</div>;

    return (
        <div className="kisan-khata-page">
            <div className="kisan-header">
                <h1>📓 {t('ledger.title')}</h1>
                <div className="user-badge">👨‍🌾 {user?.name?.split(' ')[0]}</div>
            </div>

            <div className="summary-cards">
                <div className="summary-card income">
                    <h3>{t('ledger.income')}</h3>
                    <div className="amount">₹{stats.totalIncome.toLocaleString('en-IN')}</div>
                </div>
                <div className="summary-card expense">
                    <h3>{t('ledger.expense')}</h3>
                    <div className="amount">₹{stats.totalExpense.toLocaleString('en-IN')}</div>
                </div>
                <div className="summary-card profit" style={{ gridColumn: 'span 2', borderLeftColor: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                    <h3>{t('ledger.profitLoss')}</h3>
                    <div className="amount" style={{ color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                        ₹{Math.abs(netProfit).toLocaleString('en-IN')} {netProfit >= 0 ? '▲' : '▼'}
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <h2 className="section-title">{t('ledger.profitLoss')}</h2>
                <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                    {stats.totalIncome + stats.totalExpense > 0 ? (
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', alignSelf: 'center' }}>{t('ledger.noData')}</div>
                    )}
                </div>
            </div>

            <div className="chart-container">
                <h2 className="section-title">{t('ledger.byCategory')}</h2>
                <div style={{ height: '220px' }}>
                    {Object.keys(stats.byCategory).length > 0 ? (
                        <Bar data={barData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                    ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', paddingTop: '80px' }}>{t('ledger.noData')}</div>
                    )}
                </div>
            </div>

            <div className="recent-transactions">
                <h2 className="section-title">{t('ledger.recent')}</h2>
                <div className="transaction-list">
                    {entries.length > 0 ? entries.slice(0, 10).map(entry => (
                        <div key={entry._id} className="transaction-item">
                            <div className="tx-info">
                                <span className="tx-category">{entry.category.replace(/_/g, ' ')}</span>
                                <span className="tx-date">{new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className={`tx-amount ${entry.type}`}>
                                    {entry.type === 'income' ? '+' : '-'} ₹{entry.amount.toLocaleString('en-IN')}
                                </div>
                                <button
                                    onClick={() => handleDelete(entry._id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.1rem', cursor: 'pointer', padding: '2px 6px', borderRadius: '6px' }}
                                    title="Delete entry"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>{t('ledger.noData')}</div>
                    )}
                </div>
            </div>

            <div className="fab-container">
                <button className="fab expense" title={t('ledger.addExpense')} onClick={() => handleOpenModal('expense')}>-</button>
                <button className="fab income" title={t('ledger.addIncome')} onClick={() => handleOpenModal('income')}>+</button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="khata-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalType === 'income' ? t('ledger.addIncome') : t('ledger.addExpense')}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('ledger.amount')}</label>
                                <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>{t('ledger.category')}</label>
                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {categories[modalType].map(cat => (
                                        <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('ledger.date')}</label>
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>{t('ledger.description')}</label>
                                <input type="text" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. 5 laborers" />
                            </div>
                            <button type="submit" className="submit-btn" style={{ background: modalType === 'income' ? '#10b981' : '#ef4444' }}>
                                {t('ledger.save')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
