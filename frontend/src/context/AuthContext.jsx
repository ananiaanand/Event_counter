import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            // Simplified for this scope, ideally we'd decode JWT or fetch /me endpoint
            setUser({ isAuthenticated: true });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:8000/api/token/', {
                username,
                password
            });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            setUser({ isAuthenticated: true, username });
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.detail || 'Login failed' 
            };
        }
    };

    const register = async (username, password) => {
        try {
            await axios.post('http://localhost:8000/api/register/', {
                username,
                password
            });
            // Automatically login after successful registration
            return login(username, password);
        } catch (error) {
            let errorMsg = 'Registration failed';
            if (error.response?.data) {
                const data = error.response.data;
                if (data.username) errorMsg = data.username[0];
                else if (data.password) errorMsg = data.password[0];
            }
            return { success: false, error: errorMsg };
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
