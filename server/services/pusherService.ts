import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true, // transport layer security - ensures secure communication
});

export const sendNotificationToPusher = async (
  channel: string,
  event: string,
  data: any
) => {
  await pusher.trigger(channel, event, data);
  console.log(`Notification sent to channel ${channel}`);
};
