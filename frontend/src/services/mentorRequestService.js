import api from "./api";

// Student
export const sendMentorRequest = async (mentorId, message) => {
  const response = await api.post("/mentor-requests", {
    mentorId,
    message,
  });

  return response.data;
};

export const getMyMentorRequests = async () => {
  const response = await api.get("/mentor-requests/my");

  return response.data;
};

// Alumni
export const getReceivedMentorRequests = async () => {
  const response = await api.get("/mentor-requests/received");

  return response.data;
};

export const updateMentorRequestStatus = async (requestId, status) => {
  const response = await api.put(`/mentor-requests/${requestId}/status`, {
    status,
  });

  return response.data;
};
