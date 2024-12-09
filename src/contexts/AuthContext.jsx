// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    console.log(localStorage.getItem('authToken'))
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userId, setUserId] = useState(null);
    const [isTokenExpired, setIsTokenExpired] = useState(false);


    const login = (token, refreshToken) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        setAuthToken(token);
        setRefreshToken(refreshToken);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setAuthToken(null);
        setRefreshToken(null);
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

