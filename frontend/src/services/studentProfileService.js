import api from "./api";

export const getMyStudentProfile = async () => {
  const response = await api.get("/student-profile/me");
  return response.data;
};

export const updateStudentProfile = async (profileData) => {
  const response = await api.put("/student-profile/me", profileData);

  return response.data;
};

export const getStudentProfileById = async (id) => {
  const response = await api.get(`/student-profile/${id}`);
  return response.data;
};
