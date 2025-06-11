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

  if (recipients.length === 0) {
    console.log("No recipients found for notifications");
    return;
  }

  console.log(`Processing notifications for ${recipients.length} users`);

  // Prepare notification data
  const notificationData = {
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
  };

  // Create database notifications in batch
  const notificationsToCreate = recipients.map((recipient) => ({
    userId: recipient._id,
    ...notificationData,
  }));

  const createdNotifications = await Notification.insertMany(
    notificationsToCreate
  );
  console.log(`Created ${createdNotifications.length} database notifications`);

  // Send Pusher notifications in parallel with error handling
  const pusherPromises = recipients.map(async (recipient, index) => {
    try {
      const notification = createdNotifications[index];
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

      return { success: true, userId: recipient._id };
    } catch (error) {
      console.error(
        `Failed to send Pusher notification to user ${recipient._id}:`,
        error
      );
      return { success: false, userId: recipient._id, error };
    }
  });

  // Process all Pusher notifications in parallel
  const results = await Promise.allSettled(pusherPromises);

  const successful = results.filter(
    (result) => result.status === "fulfilled" && result.value.success
  ).length;

  const failed = results.length - successful;

  console.log(
    `Notification summary: ${successful} successful, ${failed} failed out of ${recipients.length} total`
  );
};
