/**
 * API client for Ovelin Mall
 *
 * Cookie strategy:
 * React Native's fetch does NOT expose Set-Cookie headers to JS.
 * Instead we use @react-native-cookies/cookies which hooks into the native
 * HTTP stack to manage cookies transparently.  We still manually persist the
 * cookie in AsyncStorage as a fallback so restarts work even on devices where
 * the cookie jar is cleared by the OS.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';

export const BASE_URL = 'https://ovelinmall-ovelin-mall.hf.space';

const SESSION_KEY = 'ovelin_session_cookie';

// ──────────────────────────────────────────────
// Cookie helpers
// ──────────────────────────────────────────────

/** Read the persisted session string from AsyncStorage */
async function getSessionCookie(): Promise<string | null> {
  return AsyncStorage.getItem(SESSION_KEY);
}

/**
 * Persist the session cookie.
 * We write both to AsyncStorage (survives full restarts) and set it in
 * CookieManager so the native layer sends it automatically on every request.
 */
async function saveSessionCookie(raw: string) {
  await AsyncStorage.setItem(SESSION_KEY, raw);
  // Parse `connect.sid=<value>; Path=/; ...` into name/value
  const [nameValue] = raw.split(';');
  const eqIdx = nameValue.indexOf('=');
  if (eqIdx === -1) return;
  const name = nameValue.slice(0, eqIdx).trim();
  const value = nameValue.slice(eqIdx + 1).trim();
  await CookieManager.set(BASE_URL, { name, value, path: '/', version: '1' });
}

/** Clear session from both stores (logout) */
export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
  await CookieManager.clearAll();
}

/**
 * Bootstrap: restores the cookie from AsyncStorage into the native jar.
 * Call once at app startup (inside AuthContext).
 */
export async function restoreSession() {
  const raw = await getSessionCookie();
  if (!raw) return;
  await saveSessionCookie(raw); // re-injects into native jar
}

// ──────────────────────────────────────────────
// Core fetch wrapper
// ──────────────────────────────────────────────

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  // Build headers — always send JSON; native cookie jar handles the Cookie header
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // tells the native layer to send cookies
  });

  // Best-effort: attempt to read Set-Cookie from the response header in case
  // the device's WebKit/OkHttp stack does expose it.
  const rawCookie = res.headers.get('set-cookie');
  if (rawCookie && rawCookie.includes('connect.sid')) {
    await saveSessionCookie(rawCookie);
  } else {
    // Also check native cookie jar — the OS may have stored it already
    const jar = await CookieManager.get(BASE_URL);
    const sid = jar['connect.sid'];
    if (sid?.value) {
      const rebuilt = `connect.sid=${sid.value}; Path=/`;
      await AsyncStorage.setItem(SESSION_KEY, rebuilt);
    }
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body?.message || body?.error || msg;
    } catch {}
    throw new Error(msg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

// ──────────────────────────────────────────────
// Convenience wrappers
// ──────────────────────────────────────────────

export function apiGet<T>(path: string): Promise<T> {
  return api<T>(path, { method: 'GET' });
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return api<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });
}

export function apiPut<T>(path: string, body?: unknown): Promise<T> {
  return api<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });
}

export function apiDelete<T>(path: string): Promise<T> {
  return api<T>(path, { method: 'DELETE' });
}
