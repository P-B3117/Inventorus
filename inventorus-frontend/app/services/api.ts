// API configuration and base utilities

// Dynamically get API URL based on current origin
// In development with Vite proxy: uses "/api"
// In production: uses current origin + "/api" (e.g., http://localhost:8080/api)
function getApiBaseUrl(): string {
  // If VITE_API_URL is explicitly set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Use current origin + /api (e.g., http://localhost:8080/api)
    return `${window.location.origin}/api`;
  }

  // Fallback for SSR or non-browser environments
  return "/api";
}

const API_BASE_URL = getApiBaseUrl();

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
      );
    }

    // Handle empty responses
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    // Get the response text first for better error handling
    const text = await response.text();

    // Check if response is actually JSON
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      console.error("Response is not JSON:", {
        url,
        contentType,
        text: text.substring(0, 200), // First 200 chars for debugging
      });
      throw new ApiError(
        `Expected JSON response but got ${contentType || "unknown content type"}`,
        response.status,
      );
    }

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      console.error("JSON parse error:", {
        url,
        text: text.substring(0, 200), // First 200 chars for debugging
        error: parseError,
      });
      throw new ApiError(
        `Invalid JSON response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
        response.status,
      );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    apiRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: "DELETE" }),
};
