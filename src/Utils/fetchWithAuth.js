import { getAccessToken, getRefreshToken, setTokens, logout } from '../Utils/auth';
import { API_URL } from '/config.js';

/**
 * Construye los headers para una solicitud autenticada.
 */
const buildAuthHeaders = (token, customHeaders = {}) => ({
    ...customHeaders,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

/**
 * Lógica para realizar una solicitud con autenticación JWT y soporte para token refresh.
 */
export const fetchWithAuth = async (url, options = {}) => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    // Si no hay token, no intentes continuar
    if (!token) {
        logout();
        return Promise.reject(new Error('Access Token Not Found.'));
    }

    const headers = buildAuthHeaders(token, options.headers);
    let response = await fetch(url, { ...options, headers });

    // Si el token expiró y tenemos refresh token, intentamos renovarlo
    if (response.status === 401 && refreshToken) {
        try {
            const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                
                // Guarda nuevo access_token y refresh_token si se devuelve
                const newAccessToken = refreshData.access_token;
                const newRefreshToken = refreshData.refresh_token || refreshToken;
                setTokens(newAccessToken, newRefreshToken);

                // Reintenta solicitud original con nuevo token
                const retryHeaders = buildAuthHeaders(newAccessToken, options.headers);
                return fetch(url, { ...options, headers: retryHeaders });
            } else {
                logout();
                return Promise.reject(new Error('Expired or Invalid Refresh Token.'));
            }
        } catch (error) {
            logout();
            return Promise.reject(new Error('Error renewing token.'));
        }
    }

    return response;
};
