// lib/api.js  (in your Next.js project)
import { useAuth } from '@clerk/nextjs';

// For use in client components
export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = async (path, options = {}) => {
    const token = await getToken();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
  };

  return { apiFetch };
}