// fetchWithAuth.js
import { getAccessToken, getRefreshToken, setTokens, logout } from '../Utils/auth';
import { API_URL } from '/config.js';


export const fetchWithAuth = async (url, options = {}) => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();

    const baseHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    let response = await fetch(url, { ...options, headers: baseHeaders });

    if (response.status === 401 && refreshToken) {
        // Token expirado, intentar refresh
        const refreshResponse = await fetch('http://host.docker.internal:5000/auth/refresh', {
=======
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
>>>>>>> Stashed changes
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${refreshToken}`,
            }
        });

        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setTokens(refreshData.access_token, refreshToken);

            // Reintentar la petición original con nuevo token
            const retryHeaders = {
                ...options.headers,
                'Authorization': `Bearer ${refreshData.access_token}`,
                'Content-Type': 'application/json'
            };
            return fetch(url, { ...options, headers: retryHeaders });
        } else {
            logout();
        }
    }

    return response;
};
