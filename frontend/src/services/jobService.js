import api from "./api";

export const getAllJobs = async (params = {}) => {
  const response = await api.get("/jobs", { params });
  return response.data;
};

export const getMyJobs = async () => {
  const response = await api.get("/jobs/my");
  return response.data;
};

export const getJobById = async (id) => {
  const response = await api.get(`/jobs/${id}`);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post("/jobs", jobData);
  return response.data;
};

export const updateJob = async (id, jobData) => {
  const response = await api.put(`/jobs/${id}`, jobData);
  return response.data;
};

export const deleteJob = async (id) => {
  const response = await api.delete(`/jobs/${id}`);
  return response.data;
};
