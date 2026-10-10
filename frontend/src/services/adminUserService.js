import api from "./api";

// Get all registered Students and Alumni
export const getAllUsers = async (params = {}) => {
  const response = await api.get("/admin/users", {
    params,
  });

  return response.data;
};

// Get a specific Student or Alumni
export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);

  return response.data;
};

// Update user status
// Allowed statuses:
// ACTIVE
// INACTIVE
// SUSPENDED
export const updateUserStatus = async (id, status) => {
  const response = await api.patch(`/admin/users/${id}/status`, {
    status,
  });

  return response.data;
};

// Permanently delete a user account
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);

  return response.data;
};
