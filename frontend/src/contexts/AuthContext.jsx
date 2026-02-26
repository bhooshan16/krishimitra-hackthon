import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('km_user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('km_token') || null);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('km_user', JSON.stringify(userData));
        localStorage.setItem('km_token', userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('km_user');
        localStorage.removeItem('km_token');
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        setUser(updated);
        localStorage.setItem('km_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoggedIn: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
