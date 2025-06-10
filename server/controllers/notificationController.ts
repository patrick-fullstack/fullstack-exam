import { Request, Response } from "express";
import { pusher } from "../services/pusherService";
import Notification from "../models/Notification";

/**
 * Notification Controller
 *
 * Handles all notification-related business logic and database operations.
 * Separates concerns from route definitions for better maintainability.
 */

/**
 * Authenticates users for Pusher private channel subscriptions
 */
export const authenticatePusher = (req: Request, res: Response) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const userId = req.user!._id.toString();

  // Ensure user can only subscribe to their own private channel
  if (channel === `private-user-${userId}`) {
    const auth = pusher.authenticate(socketId, channel);
    res.send(auth);
  } else {
    res.status(403).send("Forbidden");
  }
};

/**
 * Retrieves all notifications for the authenticated user
 */
export const getNotifications = async (req: Request, res: Response) => {
  const notifications = await Notification.find({
    userId: req.user!._id,
  })
    .sort({ createdAt: -1 })
    .limit(50);

  // Transform database records to match client interface
  const data = notifications.map((notification) => ({
    id: notification.id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    newUser: notification.data.newUser,
    profileUrl: notification.data.profileUrl,
    timestamp: notification.createdAt.toISOString(),
    isRead: notification.isRead,
  }));

  res.json({ success: true, data });
};

/**
 * Marks a specific notification as read
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user!._id, // Security: ensure user owns the notification
    },
    { isRead: true }
  );

  res.json({ success: true });
};

/**
 * Marks all unread notifications as read for the authenticated user
 */
export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response
) => {
  await Notification.updateMany(
    {
      userId: req.user!._id,
      isRead: false,
    },
    { isRead: true }
  );

  res.json({ success: true });
};
