// API service for KanduTap
// This file centralizes all API calls and points to the Flask backend

const API_BASE_URL = "http://127.0.0.1:5000";

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "API request failed");
  }

  return response.json();
}

// Card related API calls
export const cardApi = {
  getBalance: (cardId: string) => apiRequest(`/api/cards?id=${cardId}`),

  getAllCards: () => apiRequest("/api/cards"),

  createCard: (cardId: string, initialBalance: number) =>
    apiRequest("/api/cards", {
      method: "POST",
      body: JSON.stringify({ cardId, initialBalance }),
    }),

  updateBalance: (cardId: string, balance: number) =>
    apiRequest("/api/cards", {
      method: "PUT",
      body: JSON.stringify({ id: cardId, balance }),
    }),
};

// Top-up related API calls
export const topUpApi = {
  getTopUps: (cardId: string) => apiRequest(`/api/topups?id=${cardId}`),

  createTopUp: (cardId: string, amount: number) =>
    apiRequest("/api/topups", {
      method: "POST",
      body: JSON.stringify({ cardId, amount }),
    }),
};

// Pump history related API calls
export const pumpHistoryApi = {
  getHistory: (cardId: string) => apiRequest(`/api/pump-history?id=${cardId}`),

  savePumpHistory: (cardId: string, liters: number, cost: number) =>
    apiRequest("/api/pump-history", {
      method: "POST",
      body: JSON.stringify({ cardId, liters, cost }),
    }),
};

// Admin related API calls
export const adminApi = {
  getCards: () => apiRequest("/api/admin/cards"),
  updateCardStatus: (cardId: string, status: 'active' | 'disabled') =>
    apiRequest("/api/admin/cards/status", {
      method: "PUT",
      body: JSON.stringify({ cardId, status }),
    }),
};
