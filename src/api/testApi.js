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

export async function getUsersFromBackend() {
  try {
    const res = await fetch('/member/user');
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function getChatbotCategories() {
  try {
    const res = await fetch('/api/chatbot/categories');
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}