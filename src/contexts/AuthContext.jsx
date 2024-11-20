// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    console.log(localStorage.getItem('authToken'))
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [isAdmin, setIsAdmin] = useState(false);


    const login = (token) => {
        localStorage.setItem('authToken', token);
        setAuthToken(token);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider value={
            { 
                authToken, 
                login, 
                logout, 
                setAuthToken,
                isAdmin,
                setIsAdmin    
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

