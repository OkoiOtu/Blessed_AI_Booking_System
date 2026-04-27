/**
 * api.js — central fetch helper
 *
 * Automatically injects x-company-id header on every request.
 * Import this instead of using fetch directly in all dashboard pages.
 *
 * Usage:
 *   import { api, apiUrl } from '@/lib/api';
 *   const data = await api('/bookings?perPage=20').then(r => r.json());
 */

function getCompanyId() {
  if (typeof window === 'undefined') return '';
  // Read from sessionStorage where CompanyProvider caches it
  try {
    const raw = sessionStorage.getItem('ariva_company_id');
    return raw ?? '';
  } catch { return ''; }
}

export function apiUrl(path) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? '';
  return `${base}${path}`;
}

export function api(path, options = {}) {
  const companyId = getCompanyId();
  const headers   = {
    ...(options.headers ?? {}),
    ...(companyId ? { 'x-company-id': companyId } : {}),
  };

  // Only set Content-Type for JSON bodies (not FormData)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(apiUrl(path), { ...options, headers });
}
