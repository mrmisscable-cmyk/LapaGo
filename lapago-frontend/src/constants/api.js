import { loadSession } from './profile';

export const API_URL = 'http://192.168.137.203:3000';

export async function apiRequest(path, options = {}) {
  let response;
  try {
    const session = await loadSession();
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(`Tidak dapat terhubung ke server ${API_URL}. Jalankan backend dan pastikan ponsel serta komputer berada di Wi-Fi yang sama.`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server mengembalikan respons yang tidak valid (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data.error || 'Permintaan ke server gagal.');
  }

  return data;
}