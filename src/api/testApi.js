export async function pingBackend() {
  try {
    const res = await fetch('/api/ping');
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return await res.text();
  } catch (error) {
    // Optionally log or handle the error
    throw error;
  }
}
