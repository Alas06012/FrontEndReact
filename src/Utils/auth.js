// src/utils/auth.js

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Guarda los tokens en localStorage
 */
export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Obtiene el access_token actual
 */
export const getAccessToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Obtiene el refresh_token actual
 */
export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Limpia todos los tokens (logout)
 */
export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Verifica si el usuario está autenticado
 */
export const isAuthenticated = () => {
    return !!getAccessToken(); // true si existe el token
};

/**
 * Redirige al login y limpia tokens
 */
export const logout = () => {
    clearTokens();
    window.location.href = '/login';
};
