// frontend/src/services/api.js
import API_URL from '../config';

// -- AUTHENTICATION ----------------------------------
export async function login({ username, password }, remember) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Login falhou');
    const data = await res.json();
    // Armazena token conforme remember
    if (remember) localStorage.setItem('token', data.token);
    else sessionStorage.setItem('token', data.token);
    return data;
}

export async function register({ username, password, sector }) {
    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, sector })
    });
    if (!res.ok) throw new Error('Registro falhou');
    return res.json();
}

// helper para pegar token de qualquer componente
function getAuthHeaders(token) {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// -- CATEGORIES --------------------------------------
export async function getCategories(type, token) {
    const res = await fetch(`${API_URL}/api/categories?type=${type}`, {
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Não foi possível buscar categorias');
    return res.json();
}

export async function createCategory({ type, name }, token) {
    const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ type, name })
    });
    if (!res.ok) throw new Error('Falha ao criar categoria');
    return res.json();
}

export async function deleteCategory(id, token) {
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Falha ao excluir categoria');
    return res.text();
}

// -- USERS -------------------------------------------
export async function getUsers(token) {
    const res = await fetch(`${API_URL}/api/users`, {
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Não foi possível buscar usuários');
    return res.json();
}

export async function createUser({ username, password, sector }, token) {
    const res = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ username, password, sector })
    });
    if (!res.ok) throw new Error('Falha ao criar usuário');
    return res.json();
}

export async function deleteUser(id, token) {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Falha ao excluir usuário');
    return res.text();
}

// -- ATENDIMENTOS ------------------------------------
export async function getAtendimentos(token) {
    const res = await fetch(`${API_URL}/api/atendimentos`, {
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Não foi possível buscar atendimentos');
    return res.json();
}

export async function createAtendimento(data, token) {
    const res = await fetch(`${API_URL}/api/atendimentos`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao criar atendimento');
    return res.json();
}

export async function updateAtendimento(id, data, token) {
    const res = await fetch(`${API_URL}/api/atendimentos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Falha ao atualizar atendimento');
    return res.json();
}

export async function deleteAtendimento(id, token) {
    const res = await fetch(`${API_URL}/api/atendimentos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Falha ao excluir atendimento');
    return res.text();
}

// -- RELATÓRIOS --------------------------------------
export async function getReport(date, token) {
    const res = await fetch(`${API_URL}/api/atendimentos/report?date=${date}`, {
        headers: getAuthHeaders(token)
    });
    if (!res.ok) throw new Error('Falha ao gerar relatório');
    return res.blob();
}
