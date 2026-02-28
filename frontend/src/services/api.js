import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('km_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

export const cropsAPI = {
    recommend: (data) => api.post('/crops/recommend', data),
    timing: (data) => api.post('/crops/timing', data),
    getAll: () => api.get('/crops/all'),
};

export const diseaseAPI = {
    identify: (formData) => api.post('/disease/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    analyzeSymptoms: (data) => api.post('/disease/analyze-symptoms', data),
};

export const fertilizerAPI = {
    recommend: (data) => api.post('/fertilizer/recommend', data),
    getOrganic: () => api.get('/fertilizer/organic'),
};

export const marketplaceAPI = {
    getProducts: (params) => api.get('/marketplace/products', { params }),
    getProduct: (id) => api.get(`/marketplace/products/${id}`),
    createOrder: (data) => api.post('/marketplace/orders', data),
    getOrders: () => api.get('/marketplace/orders'),
};

export const mandiAPI = {
    getRates: (params) => api.get('/market/rates', { params }),
    getCommodities: () => api.get('/market/commodities'),
    getStates: () => api.get('/market/states'),
};

export const alertsAPI = {
    create: (data) => api.post('/alerts', data),
    getAll: (userId) => api.get('/alerts', { params: { userId } }),
    delete: (id) => api.delete(`/alerts/${id}`),
    toggle: (id) => api.put(`/alerts/${id}/toggle`),
    getTriggered: (userId) => api.get('/alerts/triggered', { params: { userId } }),
};

export const aiAPI = {
    chat: (data) => api.post('/ai/chat', data),
    cropRecommend: (data) => api.post('/ai/crop-recommendation', data),
};

export const weatherAPI = {
    getForecast: (params) => api.get('/weather/forecast', { params }),
    getAlerts: (params) => api.get('/weather/alerts', { params }),
};

export const profitAPI = {
    calculate: (data) => api.post('/profit/calculate', data),
    compare: (data) => api.post('/profit/compare', data),
};

export const ledgerAPI = {
    getEntries: () => api.get('/ledger'),
    addEntry: (data) => api.post('/ledger', data),
    deleteEntry: (id) => api.delete(`/ledger/${id}`),
    getStats: () => api.get('/ledger/stats'),
};

export const labsAPI = {
    getAll: (params) => api.get('/labs', { params }),
    book: (data) => api.post('/labs/book', data),
    getBookings: () => api.get('/labs/bookings'),
};

export default api;
