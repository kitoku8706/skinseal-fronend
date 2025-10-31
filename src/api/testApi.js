export async function pingBackend() {
  try {
    const res = await fetch('http://18.210.20.169:8090/api/ping');
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
    const res = await fetch('http://18.210.20.169:8090/member/user');
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
    const res = await fetch('http://18.210.20.169:8090/api/chatbot/categories');
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}
