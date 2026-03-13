const API_BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/admin';
    throw new Error('Nicht autorisiert');
  }

  return res;
}

export async function login(username, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  localStorage.setItem('token', data.token);
  localStorage.setItem('username', data.username);
  return data;
}

export async function submitGuest(guestData) {
  const res = await request('/guests', {
    method: 'POST',
    body: JSON.stringify(guestData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function getGuests(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await request(`/guests?${query}`);
  if (!res.ok) throw new Error('Fehler beim Laden');
  return res.json();
}

export async function exportCSV(params = {}) {
  const query = new URLSearchParams(params).toString();
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/guests/export?${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Export fehlgeschlagen');
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition');
  const match = disposition && disposition.match(/filename="(.+)"/);
  const filename = match ? match[1] : 'export.csv';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
