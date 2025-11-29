// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // console.log(localStorage.getItem('authToken')) // Opcional: Debug

    // --- ESTADOS INICIALES (Recuperando de LocalStorage) ---
    const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
    // Convertimos el string "true"/"false" de localStorage a booleano
    const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [nombre, setNombre] = useState(localStorage.getItem('nombre') || null);
    const [rol, setRol] = useState(localStorage.getItem('rol') || null);
    const [departamento, setDepartamento] = useState(localStorage.getItem('departamento') || null);
    const [departamentoId, setDepartamentoId] = useState(localStorage.getItem('departamentoId') || null);

    const [isTokenExpired, setIsTokenExpired] = useState(false);
    const [authMessage, setAuthMessage] = useState('');

    /**
     * Función unificada para iniciar sesión
     * @param {string} token - Access token
     * @param {string} refresh - Refresh token
     * @param {object} userData - Objeto con datos del usuario (id, admin, nombre, rol, depto, etc)
     */
    const login = (token, refresh, userData) => {
        // 1. Guardar en LocalStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('isAdmin', userData.es_administrador); // Guarda "true" o "false" string
        localStorage.setItem('userId', userData.id);
        localStorage.setItem('nombre', userData.nombre);
        localStorage.setItem('rol', userData.rol);

        // Manejo de departamento (puede ser null o "No aplica")
        const deptoNombre = userData.departamento?.nombre || "";
        const deptoId = userData.departamento?.id || "";

        localStorage.setItem('departamento', deptoNombre);
        localStorage.setItem('departamentoId', deptoId);

        // 2. Actualizar Estado
        setAuthToken(token);
        setRefreshToken(refresh);
        setIsAdmin(userData.es_administrador);
        setUserId(userData.id);
        setNombre(userData.nombre);
        setRol(userData.rol);
        setDepartamento(deptoNombre);
        setDepartamentoId(deptoId);

        setAuthMessage('Sesión iniciada correctamente');
    };

    // Función auxiliar para actualizar datos sin reloguear (opcional)
    const setUserDetails = (id, nombre, rol) => {
        setUserId(id);
        setNombre(nombre);
        setRol(rol);
        // También actualizar localStorage si es necesario
        localStorage.setItem('userId', id);
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('rol', rol);
    }

    const logout = () => {
        // 1. Limpiar LocalStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        localStorage.removeItem('nombre');
        localStorage.removeItem('rol');
        localStorage.removeItem('departamento');
        localStorage.removeItem('departamentoId');

        // 2. Limpiar Estado
        setAuthToken(null);
        setRefreshToken(null);
        setIsAdmin(false);
        setUserId(null);
        setNombre(null);
        setRol(null);
        setDepartamento(null);
        setDepartamentoId(null);
        setAuthMessage('');
    };

    return (
        <AuthContext.Provider value={{
            authToken,
            setAuthToken,
            refreshToken,
            login,
            logout,
            isAdmin,
            setIsAdmin,
            userId,
            setUserId,
            isTokenExpired,
            setIsTokenExpired,
            nombre,
            setNombre,
            rol,
            setRol,
            departamento,
            setDepartamento,
            departamentoId,
            setDepartamentoId,
            authMessage,
            setAuthMessage,
            setUserDetails
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;