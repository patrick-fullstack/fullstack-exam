import { User, UserRole } from "../models/User";
import { sendNotificationToPusher } from "./pusherService";
import Notification from "../models/Notification";

export const notifyUsersOfNewUser = async (newUser: any) => {
  // Get all managers and employees (except the newly created user)
  const recipients = await User.find({
    _id: { $ne: newUser._id },
    role: { $in: [UserRole.MANAGER, UserRole.EMPLOYEE] },
    isActive: true,
  }).select("_id email firstName lastName role");

  // Create notifications for each recipient
  for (const recipient of recipients) {
    // Save to database
    const notification = await Notification.create({
      userId: recipient._id,
      type: "user_created",
      title: "New User Created",
      message: `${newUser.firstName} ${newUser.lastName} has joined as ${newUser.role}`,
      data: {
        newUser: {
          id: newUser._id.toString(),
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          avatar: newUser.avatar,
        },
        profileUrl: `/users/${newUser._id}`,
      },
      isRead: false,
    });

    // Send via Pusher
    const pusherData = {
      id: notification.id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      newUser: notification.data.newUser,
      profileUrl: notification.data.profileUrl,
      timestamp: notification.createdAt.toISOString(),
      isRead: false,
    };

    await sendNotificationToPusher(
      `private-user-${recipient._id}`,
      "new-user-notification",
      pusherData
    );
  }
  console.log(`Sent notifications to ${recipients.length} users`);
};
