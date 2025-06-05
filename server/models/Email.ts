import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledEmail extends Document {
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  template: string;
  sendNow: boolean;
  scheduledFor?: Date;
  status: "pending" | "sent" | "failed" | "cancelled";
  sentAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  //Audit
  createdBy: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledEmailSchema = new Schema<IScheduledEmail>(
  {
    fromName: {
      type: String,
      required: [true, "From name is required"],
      trim: true,
    },
    fromEmail: {
      type: String,
      required: [true, "From email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    toName: {
      type: String,
      required: [true, "To name is required"],
      trim: true,
    },
    toEmail: {
      type: String,
      required: [true, "To email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    template: {
      type: String,
      default: "default",
    },
    sendNow: {
      type: Boolean,
      default: true,
    },
    scheduledFor: {
      type: Date,
      required: function (this: IScheduledEmail) {
        return !this.sendNow; // Required only if not sending now
      },
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "cancelled"],
      default: "pending",
    },
    sentAt: Date,
    failedAt: Date,
    errorMessage: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
  },
  {
    timestamps: true,
  }
);

export const ScheduledEmail = mongoose.model<IScheduledEmail>(
  "ScheduledEmail",
  scheduledEmailSchema
);
