import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const createNotification = async ({
  recipient,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    const user = await User.findById(recipient).select(
      "notificationPreferences",
    );

    if (!user) {
      console.error("Notification recipient not found:", recipient);
      return null;
    }

    const preferences = {
      jobs: user.notificationPreferences?.jobs ?? true,
      mentorship: user.notificationPreferences?.mentorship ?? true,
      events: user.notificationPreferences?.events ?? true,
    };

    /*
     * Check whether the user has enabled this
     * category of notifications.
     */

    if (type === "JOB_APPLICATION" || type === "APPLICATION_STATUS") {
      if (!preferences.jobs) {
        return null;
      }
    }

    if (type === "MENTOR_REQUEST" || type === "MENTOR_REQUEST_STATUS") {
      if (!preferences.mentorship) {
        return null;
      }
    }

    if (type === "EVENT") {
      if (!preferences.events) {
        return null;
      }
    }

    // GENERAL notifications are always allowed

    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedId,
    });

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);

    // Notification failure should not break the main operation
    return null;
  }
};
