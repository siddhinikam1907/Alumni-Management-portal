import api from "./api";

// Student - apply for a job
export const applyForJob = async (jobId, formData) => {
  const response = await api.post(`/applications/${jobId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// Student - get own applications
export const getMyApplications = async () => {
  const response = await api.get("/applications/my");
  return response.data;
};

// Alumni/Admin - get applications for a job
export const getJobApplications = async (jobId) => {
  const response = await api.get(`/applications/job/${jobId}`);
  return response.data;
};

// Alumni/Admin - update application status
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.put(`/applications/${applicationId}/status`, {
    status,
  });

  return response.data;
};
