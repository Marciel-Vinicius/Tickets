// frontend/src/api.js
const BASE = process.env.REACT_APP_API_URL || 'https://tickets-backend-bx9t.onrender.com/api';

export default async function apiFetch(path, { method = 'GET', body, ...options } = {}) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers = { ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(body);
    }
    const res = await fetch(`${BASE}${path}`, { method, headers, body });
    if (res.status === 401) {
        // redireciona para login
        window.location.href = '/';
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || res.statusText);
    }
    if (res.status === 204) return null;
    return res.json();
}
