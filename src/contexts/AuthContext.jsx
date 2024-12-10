// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    console.log(localStorage.getItem('authToken'))
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') || false);
    const [userId, setUserId] = useState(null);
    const [isTokenExpired, setIsTokenExpired] = useState(false);


    const login = (token, refreshToken, admin) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('isAdmin', admin);
        setAuthToken(token);
        setRefreshToken(refreshToken);
        setIsAdmin(admin);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAdmin');
        setAuthToken(null);
        setRefreshToken(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={
            { 
                authToken, 
                login, 
                logout, 
                setAuthToken,
                isAdmin,
                setIsAdmin,
                userId,
                setUserId,
                refreshToken,isTokenExpired, setIsTokenExpired
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

