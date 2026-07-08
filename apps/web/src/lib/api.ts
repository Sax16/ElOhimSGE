// Cliente HTTP mínimo contra la API Nest a través del proxy /api de Vite.

export interface ApiFieldError {
  path: string;
  message: string;
}

/** Error de la API. Lleva el status HTTP y, si el ZodValidationPipe respondió, los errores por campo. */
export class ApiError extends Error {
  status: number;
  errors?: ApiFieldError[];

  constructor(status: number, message: string, errors?: ApiFieldError[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
}

/**
 * Hace fetch a `/api{path}` con la cookie de sesión. Serializa `body` a JSON.
 * Si la respuesta no es ok, parsea el error del Nest ({ message, errors? }) y lanza ApiError.
 * 204 (sin contenido) resuelve a undefined.
 */
export async function apiFetch<T>(path: string, opts: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`/api${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  if (!res.ok) {
    let message = `Error ${res.status}`;
    let errors: ApiFieldError[] | undefined;
    try {
      const data = (await res.json()) as { message?: string | string[]; errors?: ApiFieldError[] };
      if (Array.isArray(data.message)) message = data.message.join(' ');
      else if (data.message) message = data.message;
      errors = data.errors;
    } catch {
      // respuesta sin cuerpo JSON: se mantiene el mensaje por defecto
    }
    throw new ApiError(res.status, message, errors);
  }

  // 200 con cuerpo vacío (poco común): resolver a undefined
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
