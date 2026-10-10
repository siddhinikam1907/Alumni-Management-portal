import api from "./api";

export const getAlumni = async (params = {}) => {
  const response = await api.get("/alumni", {
    params,
  });

  return response.data;
};

export const getAlumniById = async (id) => {
  const response = await api.get(`/alumni/${id}`);

  return response.data;
};

export const getMyAlumniProfile = async () => {
  const response = await api.get("/alumni/profile/me");

  return response.data;
};

export const updateMyAlumniProfile = async (profileData) => {
  const response = await api.put("/alumni/profile/me", profileData);

  return response.data;
};
