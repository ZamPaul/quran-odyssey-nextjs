// app/hooks/useTeacherFetch.js
'use client';

import { useCallback } from 'react';
import { useAuth }     from '@clerk/nextjs';
import { useRouter }   from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TIMEOUT_MS = 15000; // 15 seconds

/**
 * Build an Error carrying everything the caller needs to render a useful
 * message — including `details`, the per-field validation array the API
 * returns as { error, details: [...] }.
 *
 * `apiError` marks this as an error WE created deliberately, so the network
 * fallbacks at the bottom of the catch don't overwrite it. Without that flag,
 * a genuine validation error can be reported as "Cannot reach the server".
 */
function apiError(message, { status, details, body } = {}) {
  const err = new Error(message);
  err.apiError = true;
  if (status !== undefined) err.status = status;
  if (details !== undefined) err.details = details;
  if (body !== undefined) err.body = body;
  return err;
}

export default function useTeacherFetch() {
  const { getToken, signOut } = useAuth();
  const router = useRouter();

  const apiFetch = useCallback(async (path, options = {}) => {
    if (!API_URL) throw apiError('NEXT_PUBLIC_API_URL is not configured');

    // Abort controller for timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const token = await getToken();
      if (!token) {
        router.push('/login');
        throw apiError('Not authenticated', { status: 401 });
      }

      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      // Session expired or invalid token
      if (res.status === 401) {
        console.warn('Session expired — redirecting to login');
        router.push('/login');
        throw apiError('Session expired. Please sign in again.', { status: 401 });
      }

      // Teacher role revoked
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        throw apiError(body.error || 'Access denied', {
          status: 403, details: body.details, body,
        });
      }

      // Not found
      if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        throw apiError(body.error || 'Resource not found', {
          status: 404, details: body.details, body,
        });
      }

      // Rate limited
      if (res.status === 429) {
        throw apiError('Too many requests. Please wait a moment and try again.', { status: 429 });
      }

      // Other errors — including 400 validation failures.
      //
      // `details` carries the per-field messages ("Title is too long…",
      // "Due date has already passed…"). Callers map them onto the field
      // they belong to; without this the teacher only ever sees
      // "Validation failed" with no idea what to fix.
      //
      // `body` is passed through whole so callers can read flags such as
      // `requiresForce` on a 409 without a second raw fetch.
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw apiError(body.error || `Request failed (${res.status})`, {
          status: res.status, details: body.details, body,
        });
      }

      // 204 No Content, or an empty body — don't blow up on JSON.parse.
      if (res.status === 204) return null;
      return res.json().catch(() => ({}));
    } catch (err) {
      // Request aborted (timeout)
      if (err.name === 'AbortError') {
        throw apiError('Request timed out. Check your connection and try again.', { status: 0 });
      }

      // Errors we built above already carry status/details — pass them
      // straight through. Previously the TypeError check below could swallow
      // these and replace a real validation message with a network message.
      if (err.apiError) throw err;

      // Genuine network failure (server unreachable, DNS, CORS, offline)
      if (err instanceof TypeError || err.message === 'Failed to fetch') {
        throw apiError('Cannot reach the server. Check your connection.', { status: 0 });
      }

      // Anything else — surface as-is rather than disguising it.
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }, [getToken, router]);

  return { apiFetch };
}