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
      const body = await res.json().catch(() => ({ error: 'Request failed' }));
      const err = new Error(body.message || body.error || `HTTP ${res.status}`);
      console.log("error occurred in useApi hook");
      err.code = body.code;
      err.status = res.status;
      throw err;
    }

    return res.json();
  };

  return { apiFetch };
}