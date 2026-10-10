import mongoose from "mongoose";

import Event from "../models/Event.js";
import EventRegistration from "../models/EventRegistration.js";

// Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.registrationRequired) {
      return res.status(400).json({
        success: false,
        message: "Registration is not required for this event",
      });
    }

    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: "Registration deadline has passed",
      });
    }

    const existingRegistration = await EventRegistration.findOne({
      event: eventId,
      user: req.user.userId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    const registration = await EventRegistration.create({
      event: eventId,
      user: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Registered for event successfully",
      registration,
    });
  } catch (error) {
    console.error("Event registration error:", error);

    // Handle MongoDB duplicate-key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to register for event",
      error: error.message,
    });
  }
};
// Get events registered by logged-in user
export const getMyEventRegistrations = async (req, res) => {
  try {
    const registrations = await EventRegistration.find({
      user: req.user.userId,
    })
      .populate(
        "event",
        "title description eventType date time location registrationDeadline",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get my event registrations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch registered events",
      error: error.message,
    });
  }
};
// Get participants for an event
export const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const registrations = await EventRegistration.find({
      event: eventId,
    })
      .populate("user", "name email role")
      .sort({ registeredAt: 1 });

    res.status(200).json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        eventType: event.eventType,
        date: event.date,
      },
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get event participants error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event participants",
      error: error.message,
    });
  }
};
