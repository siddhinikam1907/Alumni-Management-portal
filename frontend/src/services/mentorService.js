import api from "./api";

export const getMyMentorProfile = async () => {
  const response = await api.get("/mentors/my");
  return response.data;
};

export const createMentorProfile = async (mentorData) => {
  const response = await api.post("/mentors", mentorData);
  return response.data;
};

export const updateMentorProfile = async (mentorData) => {
  const response = await api.put("/mentors/my", mentorData);
  return response.data;
};
