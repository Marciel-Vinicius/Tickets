// src/services/api.js
import axios from 'axios';
import API_URL from '../config';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Auth
export const login = (body) => api.post('/api/auth/login', body);
export const register = (body) => api.post('/api/auth/register', body);

// Atendimentos
export const getAtendimentos = (token) =>
    api.get('/api/atendimentos', { headers: { Authorization: `Bearer ${token}` } });

export const createAtendimento = (data, token) =>
    api.post('/api/atendimentos', data, { headers: { Authorization: `Bearer ${token}` } });

export const updateAtendimento = (id, data, token) =>
    api.put(`/api/atendimentos/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });

export const deleteAtendimento = (id, token) =>
    api.delete(`/api/atendimentos/${id}`, { headers: { Authorization: `Bearer ${token}` } });

export const getReportPDF = (date, token) =>
    api.get(`/api/atendimentos/report?date=${date}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
    });

// Categories
export const getCategories = (type, token) =>
    api.get(`/api/categories?type=${type}`, { headers: { Authorization: `Bearer ${token}` } });

export const createCategory = (body, token) =>
    api.post('/api/categories', body, { headers: { Authorization: `Bearer ${token}` } });

export const deleteCategory = (id, token) =>
    api.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// Users
export const getUsers = (token) =>
    api.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });

export const updateUser = (id, body, token) =>
    api.put(`/api/users/${id}`, body, { headers: { Authorization: `Bearer ${token}` } });

export const deleteUser = (id, token) =>
    api.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// Reports
export const getSummary = (token) =>
    api.get('/api/reports/summary', { headers: { Authorization: `Bearer ${token}` } });

export const getByUser = (token) =>
    api.get('/api/reports/byUser', { headers: { Authorization: `Bearer ${token}` } });

export const getByDay = (token) =>
    api.get('/api/reports/byDay', { headers: { Authorization: `Bearer ${token}` } });
