import api from "./client";

export const authApi = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const foodItemApi = {
  list: (params) => api.get("/food-items", { params }),
  dashboard: () => api.get("/food-items/dashboard"),
  get: (id) => api.get(`/food-items/${id}`),
  create: (data) => api.post("/food-items", data),
  update: (id, data) => api.patch(`/food-items/${id}`, data),
  remove: (id) => api.delete(`/food-items/${id}`),
  checkFreshness: (id) => api.post(`/food-items/${id}/check-freshness`),
};

export const ocrApi = {
  scanLabel: (formData) =>
    api.post("/ocr/scan-label", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const recipeApi = {
  suggestions: () => api.get("/recipes/suggestions"),
};

export const donationApi = {
  create: (data) => api.post("/donations", data),
  available: () => api.get("/donations/available"),
  mine: () => api.get("/donations/mine"),
  matches: (id) => api.get(`/donations/${id}/matches`),
  claim: (id) => api.post(`/donations/${id}/claim`),
  deliver: (id) => api.post(`/donations/${id}/deliver`),
};
