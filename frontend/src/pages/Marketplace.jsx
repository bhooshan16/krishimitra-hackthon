import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { marketplaceAPI } from '../services/api';
import './Marketplace.css';

export default function Marketplace() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState(() => { try { return JSON.parse(localStorage.getItem('km_cart')) || []; } catch { return []; } });
    const [showCart, setShowCart] = useState(false);
    const [checkoutModal, setCheckoutModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [toast, setToast] = useState('');
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ address: '', phone: '', payment: 'UPI' });
    const [orders, setOrders] = useState([]);
    const [showOrders, setShowOrders] = useState(false);
    const [paymentProcess, setPaymentProcess] = useState(null);

    useEffect(() => { fetchProducts(); }, [category, search]);
    useEffect(() => { localStorage.setItem('km_cart', JSON.stringify(cart)); }, [cart]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await marketplaceAPI.getProducts({ category: category !== 'all' ? category : undefined, search: search || undefined });
            setProducts(res.data.products || []);
        } catch { } finally { setLoading(false); }
    };

    const fetchOrders = async () => {
        try {
            const res = await marketplaceAPI.getOrders();
            setOrders(res.data.orders || []);
        } catch (err) { console.error('Error fetching orders:', err); }
    };

    const getName = (p) => typeof p.name === 'object' ? (p.name[language] || p.name.en) : p.name;
    const getDesc = (p) => typeof p.description === 'object' ? (p.description[language] || p.description.en) : (p.description || '');

    const addToCart = (product) => {
        const id = product._id || product.id;
        setCart(prev => {
            const existing = prev.find(i => i.id === id);
            if (existing) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { id, name: getName(product), price: product.price, qty: 1 }];
        });
        showToast(`${getName(product)} added to cart! 🛒`);
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
    const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const submitOrderAPI = async () => {
        try {
            await marketplaceAPI.createOrder({ products: cart.map(i => ({ name: i.name, price: i.price, quantity: i.qty })), totalAmount: cartTotal, deliveryAddress: form.address, phone: form.phone, paymentMethod: form.payment });
            setCart([]);
            setCheckoutModal(false);
            setShowCart(false);
            showToast('✅ Order placed successfully!');
            fetchOrders();
        } catch { showToast('❌ Order failed. Try again.'); }
    };

    const placeOrder = async () => {
        if (!form.address.trim() || !form.phone.trim()) {
            return showToast('⚠️ Please enter a valid Delivery Address and Phone Number');
        }
        if (form.payment === 'UPI' || form.payment === 'Card') {
            setCheckoutModal(false);
            setPaymentProcess('scanning');
            setTimeout(() => {
                setPaymentProcess('success');
                setTimeout(() => {
                    setPaymentProcess(null);
                    submitOrderAPI();
                }, 1800);
            }, 2500);
            return;
        }
        submitOrderAPI();
    };

    const cats = ['all', 'seeds', 'fertilizers', 'pesticides', 'tools'];

    return (
        <div className="marketplace-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48, flex: 1 }}>
                    <h1>🛒 {t('market.title')}</h1>
                </div>
                <button
                    onClick={() => { fetchOrders(); setShowOrders(true); }}
                    style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', marginRight: 8 }}
                >
                    📦 My Orders
                </button>
                <button className="cart-float-btn" onClick={() => setShowCart(true)}>
                    🛒 <span className="cart-count">{cart.length}</span>
                </button>
            </header>

            <div className="market-search">
                <input type="text" placeholder={`🔍 ${t('common.search')}...`} value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
            </div>

            <div className="cat-tabs">
                {cats.map(c => (
                    <button key={c} className={`cat-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                        {t(`market.${c}`) || c}
                    </button>
                ))}
            </div>

            {loading ? <div className="spinner" /> : (
                <div className="products-grid">
                    {products.map((p, i) => (
                        <div key={p._id || i} className="product-card fade-in" style={{ animationDelay: `${i * 0.04}s` }} onClick={() => setSelectedProduct(p)}>
                            <div className="product-image-container">
                                {p.images && p.images.length > 0 ? (
                                    <img src={p.images[0]} alt={getName(p)} className="product-image-real" />
                                ) : (
                                    <div className="product-emoji-placeholder">
                                        {p.emoji || (p.category === 'seeds' ? '🌱' : p.category === 'fertilizers' ? '🧪' : p.category === 'pesticides' ? '🛡️' : '🔧')}
                                    </div>
                                )}
                            </div>
                            {p.isOrganic && <span className="organic-badge">🍃 Organic</span>}
                            <div className="product-name">{getName(p)}</div>
                            <div className="product-unit">{p.unit}</div>
                            <div className="product-price">₹{p.price?.toLocaleString('en-IN')}</div>
                            <div className="product-rating">{'⭐'.repeat(Math.round(p.rating || 4))} {p.rating}</div>
                            <button className="add-to-cart-btn" onClick={e => { e.stopPropagation(); addToCart(p); }}>+ {t('market.addToCart')}</button>
                        </div>
                    ))}
                </div>
            )}

            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="product-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedProduct(null)}>✕</button>
                        <div className="modal-image-container">
                            {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                <img src={selectedProduct.images[0]} alt={getName(selectedProduct)} className="modal-image-real" />
                            ) : (
                                <div className="modal-emoji-placeholder">
                                    {selectedProduct.emoji || (selectedProduct.category === 'seeds' ? '🌱' : selectedProduct.category === 'fertilizers' ? '🧪' : selectedProduct.category === 'pesticides' ? '🛡️' : '🔧')}
                                </div>
                            )}
                        </div>
                        <h2>{getName(selectedProduct)}</h2>
                        <div className="modal-price">₹{selectedProduct.price?.toLocaleString('en-IN')} <small>{selectedProduct.unit}</small></div>
                        <p className="modal-desc">{getDesc(selectedProduct)}</p>
                        {selectedProduct.npkRatio && <div className="badge badge-blue">NPK: {selectedProduct.npkRatio}</div>}
                        <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>+ Add to Cart</button>
                    </div>
                </div>
            )}

            {showCart && (
                <div className="modal-overlay" onClick={() => setShowCart(false)}>
                    <div className="cart-drawer" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowCart(false)}>✕</button>
                        <h2>🛒 Cart ({cart.length})</h2>
                        {cart.length === 0 ? <p style={{ textAlign: 'center', color: '#888', padding: '32px 0' }}>Cart is empty</p> : (
                            <>
                                {cart.map(item => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-name">{item.name}</div>
                                        <div className="cart-item-price">₹{(item.price * item.qty).toLocaleString('en-IN')} (x{item.qty})</div>
                                        <button className="cart-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                                    </div>
                                ))}
                                <div className="cart-total">Total: ₹{cartTotal.toLocaleString('en-IN')}</div>
                                <button className="btn btn-primary btn-full" onClick={() => { setShowCart(false); setCheckoutModal(true); }}>Checkout →</button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {checkoutModal && (
                <div className="modal-overlay" onClick={() => setCheckoutModal(false)}>
                    <div className="checkout-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setCheckoutModal(false)}>✕</button>
                        <h2>📦 Checkout</h2>
                        <div className="form-group"><label>Delivery Address</label><textarea rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter full address" /></div>
                        <div className="form-group"><label>Phone Number</label><input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile number" /></div>
                        <div className="form-group"><label>Payment</label>
                            <div className="payment-options">
                                {['COD', 'UPI', 'Card'].map(pm => (
                                    <label key={pm} className={`payment-option ${form.payment === pm ? 'selected' : ''}`}>
                                        <input type="radio" name="payment" value={pm} checked={form.payment === pm} onChange={() => setForm(f => ({ ...f, payment: pm }))} />
                                        {pm === 'COD' ? '💵 Cash on Delivery' : pm === 'UPI' ? '📱 UPI / GPay' : '💳 Debit Card'}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="cart-total">Total: ₹{cartTotal.toLocaleString('en-IN')}</div>
                        <button className="btn btn-primary btn-full" onClick={placeOrder}>✅ Place Order</button>
                    </div>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}

            {showOrders && (
                <div className="modal-overlay" onClick={() => setShowOrders(false)}>
                    <div className="cart-drawer" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
                        <button className="modal-close" onClick={() => setShowOrders(false)}>✕</button>
                        <h2>📦 My Orders</h2>
                        {orders.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#888', padding: '32px 0' }}>No orders yet</p>
                        ) : orders.map(order => {
                            const steps = ['pending', 'processing', 'shipped', 'delivered'];
                            const currentStep = steps.indexOf(order.status) >= 0 ? steps.indexOf(order.status) : 0;
                            const statusColor = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#10b981', cancelled: '#ef4444' }[order.status] || '#64748b';

                            return (
                                <div key={order._id} style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '16px', marginBottom: '16px', background: '#fafafa' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Placed</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#16a34a' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 16 }}>
                                        {(order.products || []).map((p, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#334155', margin: '4px 0' }}>
                                                <span>{p.quantity} × {p.name}</span>
                                                <span style={{ color: '#64748b' }}>₹{(p.price * p.quantity).toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Tracking Progress Bar */}
                                    <div style={{ background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.8rem', fontWeight: 600, color: statusColor, textTransform: 'uppercase' }}>
                                            <span>Tracking Status</span>
                                            <span>{order.status}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            {steps.map((step, idx) => (
                                                <div key={step} style={{
                                                    flex: 1,
                                                    height: 6,
                                                    borderRadius: 10,
                                                    background: idx <= currentStep ? statusColor : '#e2e8f0',
                                                    transition: 'all 0.3s'
                                                }} />
                                            ))}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                                            <span>Placed</span>
                                            <span>Packed</span>
                                            <span>Shipped</span>
                                            <span>Arriving</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
