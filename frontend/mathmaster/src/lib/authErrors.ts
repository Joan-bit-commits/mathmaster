import axios from 'axios';

export interface ParsedApiError {
  /** One sentence suitable for a banner or toast. */
  message: string;
  /** Per-field messages, keyed by the *form* field name (e.g. `firstName`). */
  fields: Record<string, string>;
}

// Backend field name -> form field name.
const FIELD_ALIASES: Record<string, string> = {
  first_name: 'firstName',
  last_name: 'lastName',
  password2: 'confirmPassword',
};

const asText = (value: unknown): string =>
  Array.isArray(value) ? value.map(String).join(' ') : String(value ?? '');

/**
 * Turns any thrown value into something a person can act on.
 *
 * The API wraps errors as `{ error: { code, message, details?: { field: [msgs] } } }`
 * (see backend config/exceptions.py), a few views return `{ error: "text" }`, and axios
 * itself only exposes the useless "Request failed with status code 400". This reads the
 * response body so users see "A user with that username already exists." instead.
 *
 * `context` enables friendlier wording for the rate-limited auth endpoints.
 */
export function parseAuthError(err: unknown, context?: 'login' | 'register'): ParsedApiError {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return { message: "We couldn't reach the server. Check your internet connection and try again.", fields: {} };
    }
    const { status, data } = err.response as { status: number; data?: { error?: unknown } };
    const envelope = data?.error;
    const fields: Record<string, string> = {};
    let message = '';

    if (typeof envelope === 'string') {
      message = envelope;
    } else if (envelope && typeof envelope === 'object') {
      const { message: text, details } = envelope as { message?: string; details?: Record<string, unknown> };
      message = text ?? '';
      if (details && typeof details === 'object') {
        for (const [key, value] of Object.entries(details)) {
          if (key === 'non_field_errors') message = asText(value);
          else fields[FIELD_ALIASES[key] ?? key] = asText(value);
        }
      }
    }

    if (status === 429 || (status === 403 && context && (!message || message === 'Permission denied.'))) {
      return { message: 'Too many attempts. Please wait a minute and try again.', fields: {} };
    }
    if (status === 401 && context === 'login') {
      return { message: 'Incorrect username or password.', fields: {} };
    }
    if (status >= 500) {
      return { message: 'Something went wrong on our side. Please try again in a moment.', fields: {} };
    }
    if (Object.keys(fields).length > 0 && (!message || message === 'Validation failed.')) {
      message = 'Please fix the highlighted fields.';
    }
    return { message: message || 'Something went wrong. Please try again.', fields };
  }

  if (err instanceof Error && err.message) return { message: err.message, fields: {} };
  return { message: 'Something went wrong. Please try again.', fields: {} };
}
