import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: "user_created" | "user_updated" | "user_deleted";
  title: string;
  message: string;
  data: {
    newUser: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
      avatar: {
        original: { type: String };
        thumbnail: { type: String };
        small: { type: String };
        medium: { type: String };
      };
    };
    profileUrl: string;
  };
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["user_created", "user_updated", "user_deleted"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      newUser: {
        id: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        role: { type: String, required: true },
        avatar: {
          original: { type: String },
          thumbnail: { type: String },
          small: { type: String },
          medium: { type: String },
        },
      },
      profileUrl: { type: String, required: true },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
