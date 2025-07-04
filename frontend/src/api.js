// frontend/src/api.js
const BASE = process.env.REACT_APP_API_URL || 'https://tickets-backend-bx9t.onrender.com/api';

export default async function apiFetch(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
    // get freshest token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const h = { ...headers };
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (body != null) {
        h['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: h,
        body,
        ...rest
    });

    if (res.status === 401) {
        // unauthorized → clear and go to login
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/';
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}
