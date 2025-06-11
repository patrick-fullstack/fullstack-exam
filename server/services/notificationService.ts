import { User, UserRole } from "../models/User";
import { sendNotificationToPusher } from "./pusherService";
import Notification from "../models/Notification";

export const notifyUsersOfNewUser = async (newUser: any) => {
  // Get all managers and employees (except the newly created user)
  const recipients = await User.find({
    _id: { $ne: newUser._id },
    role: { $in: [UserRole.MANAGER, UserRole.EMPLOYEE] },
    isActive: true,
  })
    .select("_id email firstName lastName role")
    .catch((error) => {
      console.error("Failed to find recipients:", error);
      return [];
    });

  if (recipients.length === 0) {
    console.log("No recipients found for notifications");
    return;
  }

  console.log(`Processing notifications for ${recipients.length} users`);

  // Prepare notification data template
  const notificationTemplate = {
    type: "user_created" as const,
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

  // Create all notifications in one batch operation
  const notificationsToCreate = recipients.map((recipient) => ({
    userId: recipient._id,
    ...notificationTemplate,
  }));

  const createdNotifications = await Notification.insertMany(
    notificationsToCreate
  ).catch((error) => {
    console.error("Failed to create notifications in database:", error);
    return [];
  });

  if (createdNotifications.length === 0) {
    console.log("No notifications created, skipping Pusher notifications");
    return;
  }

  console.log(
    `Created ${createdNotifications.length} notifications in database`
  );

  // Send Pusher notifications in batches
  const BATCH_SIZE = 50;
  let pusherSuccessCount = 0;

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    const batchNotifications = createdNotifications.slice(i, i + BATCH_SIZE);

    const pusherPromises = batch.map(async (recipient, index) => {
      const notification = batchNotifications[index];
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

      return sendNotificationToPusher(
        `private-user-${recipient._id}`,
        "new-user-notification",
        pusherData
      )
        .then(() => ({ success: true, userId: recipient._id }))
        .catch((error) => {
          console.error(
            `Failed to send Pusher notification to user ${recipient._id}:`,
            error
          );
          return { success: false, userId: recipient._id };
        });
    });

    // Process batch in parallel
    const results = await Promise.allSettled(pusherPromises);
    const batchSuccessCount = results.filter(
      (result) => result.status === "fulfilled" && result.value.success
    ).length;

    pusherSuccessCount += batchSuccessCount;
    console.log(
      `Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
        recipients.length / BATCH_SIZE
      )} - ${batchSuccessCount}/${batch.length} successful`
    );
  }

  console.log(
    `Notification summary: ${createdNotifications.length} saved to DB, ${pusherSuccessCount} sent via Pusher`
  );
};
