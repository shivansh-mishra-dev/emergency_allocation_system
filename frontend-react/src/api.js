/**
 * Centralized API helper with automatic fallback to direct backend port if needed.
 */
export async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, data };
    }
    throw new Error('Non-JSON response from server');
  } catch (err) {
    // Fallback: If running locally without proxy or relative fetch fails, retry directly against backend port 3005
    if (!endpoint.startsWith('http')) {
      try {
        const fallbackUrl = `http://localhost:3005${endpoint}`;
        const fallbackRes = await fetch(fallbackUrl, options);
        const data = await fallbackRes.json();
        return { ok: fallbackRes.ok, data };
      } catch (fallbackErr) {
        throw new Error(fallbackErr.message || err.message);
      }
    }
    throw err;
  }
}

