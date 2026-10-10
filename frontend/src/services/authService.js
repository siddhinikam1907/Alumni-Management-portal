import api from "./api";

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await api.put("/auth/change-password", passwordData);

  return response.data;
};

export const getNotificationPreferences = async () => {
  const response = await api.get("/auth/notification-preferences");

  return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await api.put("/auth/notification-preferences", preferences);

  return response.data;
};
