const API_BASE_URL = "http://localhost:9002";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  // Handle 204 No Content responses (common for DELETE operations)
  if (response.status === 204) {
    return null as T;
  }

  // Try to parse JSON, but handle empty responses gracefully
  const text = await response.text();
  if (!text || text.trim() === "") {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // If parsing fails, return null (shouldn't happen with proper API)
    return null as T;
  }
}
