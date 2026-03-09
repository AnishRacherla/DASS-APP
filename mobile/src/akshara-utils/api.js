import { API_BASE_URL } from '../config';

const BASE = API_BASE_URL + '/api/akshara';

async function request(path, opts = {}) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || res.statusText };
    }
    return data;
  } catch (err) {
    console.warn('API Error:', err.message);
    return { error: 'Network error — is the server running?' };
  }
}

// ─── AUTH ───
export async function signup(email, password, playerName, language) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, playerName, language }),
  });
}

export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ─── PLAYER ───
export async function getPlayer(id) {
  return request(`/player/${id}`);
}

export async function updateLanguage(id, language) {
  return request(`/player/${id}/language`, {
    method: 'PUT',
    body: JSON.stringify({ language }),
  });
}

export async function completeLevel(id, data) {
  return request(`/player/${id}/complete-level`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
