// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    console.log(localStorage.getItem('authToken'))
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') || false);
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [nombre, setNombre] = useState(localStorage.getItem('nombre') || null);
    const [rol, setRol] = useState(localStorage.getItem('rol') || null);
    const [departamento, setDepartamento] = useState(localStorage.getItem('departamento') || null);
    const [isTokenExpired, setIsTokenExpired] = useState(false);


    const login = (token, refreshToken, admin) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('isAdmin', admin);
        setAuthToken(token);
        setRefreshToken(refreshToken);
        setIsAdmin(admin);
    };
    const setUserDetails = (id, nombre, rol) => {
        setUserId(id);
        setNombre(nombre);
        setRol(rol);
    }

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        localStorage.removeItem('nombre');
        localStorage.removeItem('rol');
        localStorage.removeItem('departamento');
        setAuthToken(null);
        setRefreshToken(null);
        setIsAdmin(false);
        setUserId(null);
        setNombre(null);
        setRol(null);
        setDepartamento(null);
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
                refreshToken,
                isTokenExpired,
                setIsTokenExpired,
                nombre,
                setNombre,
                rol,
                setRol,
                departamento,
                setDepartamento
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;

