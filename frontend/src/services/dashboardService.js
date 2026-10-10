import api from "./api";

export const getStudentDashboardStats = async () => {
  const response = await api.get("/dashboard/student");
  return response.data;
};
