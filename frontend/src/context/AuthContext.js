// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(
        localStorage.getItem('token') || sessionStorage.getItem('token') || null
    );
    const [user, setUser] = useState(null);

    // decode JWT
    useEffect(() => {
        if (token) {
            const [, payload] = token.split('.');
            try {
                const { username, sector } = JSON.parse(atob(payload));
                setUser({ username, sector });
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (data, remember) => {
        const res = await apiLogin(data);
        const t = res.data.token;
        if (remember) {
            localStorage.setItem('token', t);
            sessionStorage.removeItem('token');
        } else {
            sessionStorage.setItem('token', t);
            localStorage.removeItem('token');
        }
        setToken(t);
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
    };

    const register = async (data) => {
        await apiRegister(data);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
