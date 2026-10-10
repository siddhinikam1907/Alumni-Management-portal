import { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock,
  Edit,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
} from "../../services/eventService";

function EventManagement() {
  // ==========================================
  // STATE
  // ==========================================

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const [formLoading, setFormLoading] = useState(false);

  // ==========================================
  // FORM STATE
  // ==========================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "TECH_TALK",
    date: "",
    time: "",
    location: "",
    registrationRequired: true,
    registrationDeadline: "",
  });

  // ==========================================
  // FETCH EVENTS
  // ==========================================

  const fetchEvents = async () => {
    try {
      setError("");

      const data = await getAllEvents();

      if (data.success) {
        setEvents(data.events || []);
      } else {
        setError(data.message || "Failed to fetch events.");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);

      setError(err.response?.data?.message || "Failed to fetch events.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ==========================================
  // REFRESH
  // ==========================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
  };

  // ==========================================
  // FORM INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const handleCreate = () => {
    setEditingEvent(null);

    setFormData({
      title: "",
      description: "",
      eventType: "TECH_TALK",
      date: "",
      time: "",
      location: "",
      registrationRequired: true,
      registrationDeadline: "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEdit = (event) => {
    setEditingEvent(event);

    setFormData({
      title: event.title || "",
      description: event.description || "",
      eventType: event.eventType || "TECH_TALK",
      date: event.date ? event.date.substring(0, 10) : "",
      time: event.time || "",
      location: event.location || "",
      registrationRequired: event.registrationRequired ?? true,
      registrationDeadline: event.registrationDeadline
        ? event.registrationDeadline.substring(0, 10)
        : "",
    });

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // ==========================================
  // CREATE / UPDATE EVENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormLoading(true);
      setError("");
      setSuccess("");

      let data;

      if (editingEvent) {
        data = await updateEvent(editingEvent._id, formData);
      } else {
        data = await createEvent(formData);
      }

      if (!data.success) {
        setError(data.message || "Something went wrong.");
        return;
      }

      setSuccess(
        editingEvent
          ? "Event updated successfully."
          : "Event created successfully.",
      );

      setShowForm(false);
      setEditingEvent(null);

      await fetchEvents();
    } catch (err) {
      console.error("Event save error:", err);

      setError(err.response?.data?.message || "Failed to save event.");
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // DELETE EVENT
  // ==========================================

  const handleDelete = async (event) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const data = await deleteEvent(event._id);

      if (!data.success) {
        setError(data.message || "Failed to delete event.");
        return;
      }

      setSuccess("Event deleted successfully.");

      await fetchEvents();
    } catch (err) {
      console.error("Delete event error:", err);

      setError(err.response?.data?.message || "Failed to delete event.");
    }
  };

  // ==========================================
  // VIEW PARTICIPANTS
  // ==========================================

  const handleViewParticipants = async (event) => {
    try {
      setSelectedEvent(event);
      setParticipants([]);
      setParticipantsLoading(true);
      setError("");

      const data = await getEventParticipants(event._id);

      if (data.success) {
        setParticipants(data.registrations || []);
      } else {
        setError(data.message || "Failed to fetch participants.");
      }
    } catch (err) {
      console.error("Failed to fetch participants:", err);

      setError(err.response?.data?.message || "Failed to fetch participants.");
    } finally {
      setParticipantsLoading(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-100 items-center justify-center">
          <RefreshCw size={32} className="animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Events Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create, manage and monitor college events.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <Plus size={18} />
              Create Event
            </button>
          </div>
        </div>

        {/* ======================================
            SUCCESS
        ====================================== */}

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ======================================
            SUMMARY CARDS
        ====================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <CalendarDays size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Total Events</p>

                <p className="text-2xl font-bold text-slate-900">
                  {events.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
                <Users size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Registration Events</p>

                <p className="text-2xl font-bold text-slate-900">
                  {events.filter((event) => event.registrationRequired).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <CalendarDays size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Workshops</p>

                <p className="text-2xl font-bold text-slate-900">
                  {
                    events.filter((event) => event.eventType === "WORKSHOP")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <CalendarDays size={22} />
              </div>

              <div>
                <p className="text-sm text-slate-500">Tech Talks</p>

                <p className="text-2xl font-bold text-slate-900">
                  {
                    events.filter((event) => event.eventType === "TECH_TALK")
                      .length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================
            EVENT TABLE
        ====================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Registration
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {events.map((event) => (
                  <tr key={event._id} className="transition hover:bg-slate-50">
                    {/* EVENT */}

                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {event.title}
                        </p>

                        <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                          {event.description || "No description"}
                        </p>
                      </div>
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                        {event.eventType?.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* DATE */}

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <CalendarDays size={15} />

                          {formatDate(event.date)}
                        </div>

                        {event.time && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock size={14} />

                            {event.time}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* LOCATION */}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={15} />

                        {event.location || "—"}
                      </div>
                    </td>

                    {/* REGISTRATION */}

                    <td className="px-5 py-4">
                      {event.registrationRequired ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                          Required
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                          Not Required
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {/* PARTICIPANTS */}

                        <button
                          onClick={() => handleViewParticipants(event)}
                          title="View Participants"
                          className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100"
                        >
                          <Users size={17} />
                        </button>

                        {/* EDIT */}

                        <button
                          onClick={() => handleEdit(event)}
                          title="Edit Event"
                          className="rounded-lg bg-indigo-50 p-2 text-indigo-600 transition hover:bg-indigo-100"
                        >
                          <Edit size={17} />
                        </button>

                        {/* DELETE */}

                        <button
                          onClick={() => handleDelete(event)}
                          title="Delete Event"
                          className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}

          {events.length === 0 && (
            <div className="py-16 text-center">
              <CalendarDays size={42} className="mx-auto text-slate-300" />

              <p className="mt-3 font-medium text-slate-700">No events found</p>

              <p className="mt-1 text-sm text-slate-500">
                Create your first event to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          CREATE / EDIT MODAL
      ======================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingEvent ? "Edit Event" : "Create Event"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Fill in the event details below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* TITLE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Event Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter event title"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter event description"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              {/* TYPE */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Event Type
                  </label>

                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="TECH_TALK">Tech Talk</option>

                    <option value="WORKSHOP">Workshop</option>

                    <option value="WEBINAR">Webinar</option>

                    <option value="MEETUP">Meetup</option>

                    <option value="COLLEGE_ACTIVITY">College Activity</option>

                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* LOCATION */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Auditorium / Online"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              {/* DATE + TIME */}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Time
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>

              {/* REGISTRATION */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="registrationRequired"
                    checked={formData.registrationRequired}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Registration Required
                    </p>

                    <p className="text-xs text-slate-500">
                      Students and alumni must register for this event.
                    </p>
                  </div>
                </label>
              </div>

              {/* REGISTRATION DEADLINE */}

              {formData.registrationRequired && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Registration Deadline
                  </label>

                  <input
                    type="date"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {formLoading && (
                    <RefreshCw size={16} className="animate-spin" />
                  )}

                  {editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          PARTICIPANTS MODAL
      ======================================== */}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Event Participants
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedEvent.title}
                </p>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="max-h-[70vh] overflow-y-auto">
              {participantsLoading ? (
                <div className="flex min-h-62.5 items-center justify-center">
                  <RefreshCw
                    size={30}
                    className="animate-spin text-indigo-600"
                  />
                </div>
              ) : participants.length === 0 ? (
                <div className="py-16 text-center">
                  <Users size={42} className="mx-auto text-slate-300" />

                  <p className="mt-3 font-medium text-slate-700">
                    No participants yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Nobody has registered for this event.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-150">
                    <thead className="sticky top-0 border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                          Participant
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                          Email
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                          Role
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {participants.map((registration, index) => {
                        const participant = registration.user;

                        return (
                          <tr
                            key={registration._id || index}
                            className="hover:bg-slate-50"
                          >
                            {/* PARTICIPANT */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
                                  {participant?.name?.charAt(0).toUpperCase() ||
                                    "U"}
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {participant?.name || "Unknown"}
                                  </p>

                                  <p className="text-xs text-slate-400">
                                    Registered{" "}
                                    {registration.registeredAt
                                      ? new Date(
                                          registration.registeredAt,
                                        ).toLocaleDateString("en-IN")
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* EMAIL */}
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {participant?.email || "—"}
                            </td>

                            {/* ROLE */}
                            <td className="px-6 py-4">
                              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                                {participant?.role || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default EventManagement;
