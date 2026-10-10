import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getAllEvents,
  getMyEventRegistrations,
  registerForEvent,
} from "../../services/eventService";

function Events() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const [eventsData, registrationsData] = await Promise.all([
        getAllEvents(),
        getMyEventRegistrations(),
      ]);

      if (eventsData.success) {
        setEvents(eventsData.events || []);
      }

      if (registrationsData.success) {
        setRegistrations(registrationsData.registrations || []);
      }
    } catch (error) {
      console.error("Failed to load events:", error);

      setError(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const registeredEventIds = useMemo(() => {
    return new Set(
      registrations
        .map((registration) => registration.event?._id)
        .filter(Boolean),
    );
  }, [registrations]);

  const handleRegister = async (eventId) => {
    try {
      setRegisteringId(eventId);
      setError("");
      setSuccess("");

      const data = await registerForEvent(eventId);

      if (data.success) {
        setSuccess(data.message);

        // Refresh registrations so UI immediately shows Registered
        const registrationsData = await getMyEventRegistrations();

        if (registrationsData.success) {
          setRegistrations(registrationsData.registrations || []);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to register for event");
    } finally {
      setRegisteringId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDeadline = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;

    return new Date() > new Date(deadline);
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      TECH_TALK: "Tech Talk",
      WORKSHOP: "Workshop",
      WEBINAR: "Webinar",
      MEETUP: "Meetup",
      COLLEGE_ACTIVITY: "College Activity",
      OTHER: "Other",
    };

    return labels[type] || type;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading events..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                <CalendarDays size={22} />
              </div>

              <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                College Events
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Events</h1>

            <p className="mt-1 text-sm text-slate-500">
              Discover upcoming college activities, workshops, meetups and
              webinars.
            </p>
          </div>

          <button
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <XCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CalendarDays size={21} className="text-indigo-600" />

            <p className="mt-3 text-sm text-slate-500">Total Events</p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <CheckCircle2 size={21} className="text-green-600" />

            <p className="mt-3 text-sm text-slate-500">My Registrations</p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {registrations.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <Users size={21} className="text-violet-600" />

            <p className="mt-3 text-sm text-slate-500">Registration Events</p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {events.filter((event) => event.registrationRequired).length}
            </p>
          </div>
        </div>

        {/* Events */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">All Events</h2>

            <p className="text-sm text-slate-500">
              Explore events organized by the college.
            </p>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CalendarDays size={40} className="mx-auto text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-800">
                No events available
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                There are currently no events to display.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => {
                const registered = registeredEventIds.has(event._id);

                const deadlinePassed = isDeadlinePassed(
                  event.registrationDeadline,
                );

                return (
                  <div
                    key={event._id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* Event Header */}
                    <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-5 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                          {getEventTypeLabel(event.eventType)}
                        </span>

                        {registered && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-400/20 px-3 py-1 text-xs font-semibold text-green-100">
                            <CheckCircle2 size={13} />
                            Registered
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 line-clamp-2 text-lg font-bold">
                        {event.title}
                      </h3>
                    </div>

                    {/* Event Content */}
                    <div className="flex flex-1 flex-col p-5">
                      <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                        {event.description}
                      </p>

                      <div className="mt-5 space-y-3">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <CalendarDays
                            size={17}
                            className="shrink-0 text-indigo-600"
                          />

                          <span>{formatDate(event.date)}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Clock3
                            size={17}
                            className="shrink-0 text-indigo-600"
                          />

                          <span>{event.time}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <MapPin
                            size={17}
                            className="shrink-0 text-indigo-600"
                          />

                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <UserRound
                            size={17}
                            className="shrink-0 text-indigo-600"
                          />

                          <span>
                            {event.createdBy?.name || "College Administration"}
                          </span>
                        </div>
                      </div>

                      {/* Registration info */}
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        {!event.registrationRequired ? (
                          <p className="text-xs font-medium text-slate-500">
                            Registration is not required for this event.
                          </p>
                        ) : event.registrationDeadline ? (
                          <p
                            className={`text-xs font-medium ${
                              deadlinePassed ? "text-red-600" : "text-slate-500"
                            }`}
                          >
                            Registration deadline:{" "}
                            {formatDeadline(event.registrationDeadline)}
                            {deadlinePassed && " • Deadline passed"}
                          </p>
                        ) : (
                          <p className="text-xs font-medium text-slate-500">
                            Registration is required.
                          </p>
                        )}
                      </div>

                      {/* Button */}
                      <div className="mt-5">
                        {!event.registrationRequired ? (
                          <div className="rounded-lg bg-slate-50 px-4 py-2.5 text-center text-sm font-medium text-slate-500">
                            No Registration Required
                          </div>
                        ) : registered ? (
                          <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                            <CheckCircle2 size={17} />
                            Registered
                          </div>
                        ) : deadlinePassed ? (
                          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm font-semibold text-red-600">
                            Registration Closed
                          </div>
                        ) : (
                          <button
                            onClick={() => handleRegister(event._id)}
                            disabled={registeringId === event._id}
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {registeringId === event._id
                              ? "Registering..."
                              : "Register Now"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* My Registrations */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              My Registrations
            </h2>

            <p className="text-sm text-slate-500">
              Events you have registered for.
            </p>
          </div>

          {registrations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <CheckCircle2 size={36} className="mx-auto text-slate-300" />

              <h3 className="mt-3 font-semibold text-slate-800">
                No registrations yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Register for an event above and it will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => {
                const event = registration.event;

                if (!event) return null;

                return (
                  <div
                    key={registration._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">
                            {event.title}
                          </h3>

                          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                            {getEventTypeLabel(event.eventType)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            {formatDate(event.date)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={15} />
                            {event.time}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={15} />
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
                        <CheckCircle2 size={16} />
                        Registered
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Events;
