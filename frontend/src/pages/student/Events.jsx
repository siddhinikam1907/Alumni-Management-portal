import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Clock3,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import Loading from "../../components/Loading";

import {
  getAllEvents,
  registerForEvent,
  getMyEventRegistrations,
} from "../../services/eventService";

function Events() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
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
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = (eventId) => {
    return registrations.some(
      (registration) => registration.event?._id === eventId,
    );
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;

    return new Date() > new Date(deadline);
  };

  const handleRegister = async (event) => {
    setError("");
    setSuccess("");

    try {
      setRegisteringId(event._id);

      const data = await registerForEvent(event._id);

      if (!data.success) {
        setError(data.message || "Failed to register for event.");
        return;
      }

      setSuccess(`Successfully registered for "${event.title}".`);

      await fetchEvents();
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Failed to register for event.");
    } finally {
      setRegisteringId(null);
    }
  };

  const formatEventType = (type) => {
    return type
      ?.replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "Date not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      weekday: "short",
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

  if (loading) {
    return (
      <DashboardLayout>
        <Loading text="Loading events..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            College Community
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">Events</h1>

          <p className="mt-2 text-sm text-slate-500">
            Explore talks, workshops, webinars and other college activities.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Events"
            value={events.length}
            icon={<CalendarDays size={20} />}
          />

          <StatCard
            label="My Registrations"
            value={registrations.length}
            icon={<CheckCircle2 size={20} />}
          />

          <StatCard
            label="Upcoming Events"
            value={
              events.filter((event) => new Date(event.date) >= new Date())
                .length
            }
            icon={<Users size={20} />}
          />
        </div>

        {/* Events */}
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <CalendarDays size={42} className="mx-auto text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No events available
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              New college events will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => {
              const registered = isRegistered(event._id);

              const deadlinePassed = isDeadlinePassed(
                event.registrationDeadline,
              );

              return (
                <div
                  key={event._id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  {/* Type */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                      {formatEventType(event.eventType)}
                    </span>

                    {registered && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <CheckCircle2 size={15} />
                        Registered
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="mt-4 text-xl font-bold text-slate-900">
                    {event.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {event.description}
                  </p>

                  {/* Details */}
                  <div className="mt-5 space-y-3">
                    <DetailRow
                      icon={<CalendarDays size={17} />}
                      text={formatDate(event.date)}
                    />

                    {event.time && (
                      <DetailRow
                        icon={<Clock3 size={17} />}
                        text={event.time}
                      />
                    )}

                    {event.location && (
                      <DetailRow
                        icon={<MapPin size={17} />}
                        text={event.location}
                      />
                    )}
                  </div>

                  {/* Registration */}
                  <div className="mt-auto pt-6">
                    {!event.registrationRequired ? (
                      <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-600">
                        Registration not required
                      </div>
                    ) : registered ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                        <CheckCircle2 size={17} />
                        You are registered
                      </div>
                    ) : deadlinePassed ? (
                      <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                        Registration deadline passed
                      </div>
                    ) : (
                      <>
                        {event.registrationDeadline && (
                          <p className="mb-3 text-xs text-slate-500">
                            Registration closes on{" "}
                            <span className="font-semibold text-slate-700">
                              {formatDeadline(event.registrationDeadline)}
                            </span>
                          </p>
                        )}

                        <button
                          onClick={() => handleRegister(event)}
                          disabled={registeringId === event._id}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <CalendarDays size={17} />

                          {registeringId === event._id
                            ? "Registering..."
                            : "Register Now"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function DetailRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="text-indigo-500">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Events;
