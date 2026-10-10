import api from "./api";

// ===============================
// EVENTS
// ===============================

export const getAllEvents = async () => {
  const response = await api.get("/events");
  return response.data;
};

export const getEventById = async (id) => {
  const response = await api.get(`/events/${id}`);
  return response.data;
};

// ===============================
// ADMIN - EVENT CRUD
// ===============================

export const createEvent = async (eventData) => {
  const response = await api.post("/events", eventData);
  return response.data;
};

export const updateEvent = async (id, eventData) => {
  const response = await api.put(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEvent = async (id) => {
  const response = await api.delete(`/events/${id}`);
  return response.data;
};

// ===============================
// EVENT REGISTRATION
// ===============================

export const registerForEvent = async (eventId) => {
  const response = await api.post(`/event-registrations/${eventId}`);

  return response.data;
};

export const getMyEventRegistrations = async () => {
  const response = await api.get("/event-registrations/my");

  return response.data;
};

// ===============================
// ADMIN - EVENT PARTICIPANTS
// ===============================

export const getEventParticipants = async (eventId) => {
  const response = await api.get(`/event-registrations/event/${eventId}`);

  return response.data;
};
