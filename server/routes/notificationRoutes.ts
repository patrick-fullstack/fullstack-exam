import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { pusher } from "../services/pusherService";
import { UserRole } from "../models/User";
import Notification from "../models/Notification";

const router = Router();

router.use(authenticate);

// Pusher authentication endpoint (for private channels)
router.post(
  "/pusher/auth",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  (req, res) => {
    const socketId = req.body.socket_id;
    const channel = req.body.channel_name;
    const userId = req.user!._id.toString();

    if (channel === `private-user-${userId}`) {
      const auth = pusher.authenticate(socketId, channel);
      res.send(auth);
    } else {
      res.status(403).send("Forbidden");
    }
  }
);

// Get user notifications
router.get(
  "/",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  async (req, res) => {
    const notifications = await Notification.find({
      userId: req.user!._id,
    })
      .sort({ createdAt: -1 })
      .limit(50);

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
  }
);

// Mark notification as read
router.patch(
  "/:id/read",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  async (req, res) => {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { isRead: true }
    );

    res.json({ success: true });
  }
);

// Mark all as read
router.patch(
  "/mark-all-read",
  authorize(UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE),
  async (req, res) => {
    await Notification.updateMany(
      { userId: req.user!._id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true });
  }
);

export default router;
