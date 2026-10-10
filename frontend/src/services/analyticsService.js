import api from "./api";

export const getAlumniEngagement = async () => {
  const response = await api.get("/analytics/alumni-engagement");
  return response.data;
};

export const getAlumniContributions = async () => {
  const response = await api.get("/analytics/alumni-contributions");
  return response.data;
};
