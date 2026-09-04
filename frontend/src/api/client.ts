import type { ApiError } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Lit le token CSRF depuis le cookie non-httpOnly posé par le backend
 * (voir src/web/csrf.js) et le renvoie dans l'en-tête X-CSRF-Token pour
 * toute requête de mutation (POST/PATCH/DELETE).
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)dragflow\.csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(status: number, apiError: ApiError) {
    super(apiError.message || 'Une erreur est survenue.');
    this.status = status;
    this.code = apiError.error;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method || 'GET';
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (method !== 'GET') {
    const csrf = getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    let apiError: ApiError = { error: 'unknown_error', message: 'Une erreur est survenue.' };
    try {
      apiError = await response.json();
    } catch {
      // Réponse non-JSON (ex: page d'erreur du serveur) : on garde le message générique.
    }
    throw new ApiRequestError(response.status, apiError);
  }

  return response.json() as Promise<T>;
}
