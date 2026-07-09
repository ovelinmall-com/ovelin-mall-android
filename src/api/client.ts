import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://ovelinmall-ovelin-mall.hf.space';
const COOKIE_KEY = 'ovelin_session_cookie';

async function getStoredCookie(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(COOKIE_KEY);
  } catch {
    return null;
  }
}

async function storeCookie(cookie: string) {
  try {
    await AsyncStorage.setItem(COOKIE_KEY, cookie);
  } catch {}
}

export async function clearSession() {
  try {
    await AsyncStorage.removeItem(COOKIE_KEY);
  } catch {}
}

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const cookie = await getStoredCookie();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> ?? {}),
  };
  if (cookie) headers['Cookie'] = cookie;

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  // Capture session cookie from Set-Cookie header
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    const match = setCookie.match(/connect\.sid=[^;]+/);
    if (match) await storeCookie(match[0]);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg =
      (typeof body === 'object' && body && (body as any).error) ||
      (typeof body === 'string' ? body : 'حدث خطأ');
    throw new Error(String(msg));
  }

  return body as T;
}

export function apiGet<T = any>(path: string) {
  return api<T>(path, { method: 'GET' });
}

export function apiPost<T = any>(path: string, data?: any) {
  return api<T>(path, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiPut<T = any>(path: string, data?: any) {
  return api<T>(path, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export function apiDelete<T = any>(path: string) {
  return api<T>(path, { method: 'DELETE' });
}
