// app/hooks/useTeacherFetch.js
'use client';

import { useCallback } from 'react';
import { useAuth }     from '@clerk/nextjs';
import { useRouter }   from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TIMEOUT_MS = 15000; // 15 seconds

export default function useTeacherFetch() {
  const { getToken, signOut } = useAuth();
  const router = useRouter();

  const apiFetch = useCallback(async (path, options = {}) => {
    if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured');

    // Abort controller for timeout
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const token = await getToken();
      if (!token) {
        router.push('/login');
        throw new Error('Not authenticated');
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
        throw new Error('Session expired. Please sign in again.');
      }

      // Teacher role revoked
      if (res.status === 403) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Access denied');
      }

      // Not found
      if (res.status === 404) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Resource not found');
      }

      // Rate limited
      if (res.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      // Other errors
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }

      return res.json();
    } catch (err) {
      // Request aborted (timeout)
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Check your connection and try again.');
      }
      // Network failure (API server down)
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('Cannot reach the server. Check your connection.');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }, [getToken, router]);

  return { apiFetch };
}