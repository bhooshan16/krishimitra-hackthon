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
    const [form, setForm] = useState({ address: '', phone: '', payment: 'COD' });

    useEffect(() => { fetchProducts(); }, [category, search]);
    useEffect(() => { localStorage.setItem('km_cart', JSON.stringify(cart)); }, [cart]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await marketplaceAPI.getProducts({ category: category !== 'all' ? category : undefined, search: search || undefined });
            setProducts(res.data.products || []);
        } catch { } finally { setLoading(false); }
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

    const placeOrder = async () => {
        try {
            await marketplaceAPI.createOrder({ products: cart.map(i => ({ name: i.name, price: i.price, quantity: i.qty })), totalAmount: cartTotal, deliveryAddress: form.address, phone: form.phone, paymentMethod: form.payment });
            setCart([]);
            setCheckoutModal(false);
            setShowCart(false);
            showToast('✅ Order placed successfully!');
        } catch { showToast('❌ Order failed. Try again.'); }
    };

    const cats = ['all', 'seeds', 'fertilizers', 'pesticides', 'tools'];

    return (
        <div className="marketplace-page">
            <header className="page-header">
                <button className="back-btn" onClick={() => navigate('/')}>←</button>
                <div style={{ marginLeft: 48, flex: 1 }}>
                    <h1>🛒 {t('market.title')}</h1>
                </div>
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
                            <div className="product-emoji">{p.category === 'seeds' ? '🌱' : p.category === 'fertilizers' ? '🧪' : p.category === 'pesticides' ? '🛡️' : '🔧'}</div>
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
                        <div className="modal-emoji">{selectedProduct.category === 'seeds' ? '🌱' : selectedProduct.category === 'fertilizers' ? '🧪' : selectedProduct.category === 'pesticides' ? '🛡️' : '🔧'}</div>
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
        </div>
    );
}
