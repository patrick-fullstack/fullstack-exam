import cron from "node-cron";
import { ScheduledEmail } from "../models/Email";
import { emailService } from "./emailService";
import mongoose from "mongoose";
import connectDB from "../config/database";

class EmailScheduler {
  private isProcessing = false;
  private isInitialized = false;

  // Start the scheduler - this runs every minute to check for emails to send
  start() {
    if (this.isInitialized) {
      return; // Already started, prevent duplicate initialization
    }
    // Cron pattern: * * * * * means "every minute"
    cron.schedule("* * * * *", async () => {
      if (this.isProcessing) {
        return; // Skip if already processing to avoid overlaps
      }

      // Connect to database before processing
      await connectDB();

      if (mongoose.connection.readyState !== 1) {
        console.log("Database not connected, skipping email processing");
        return;
      }

      this.isProcessing = true;
      
      setImmediate(async () => {
        await this.processEmails();
        this.isProcessing = false;
      });
    });

    this.isInitialized = true;
    console.log("Email scheduler started");
  }

  // Process emails that are ready to be sent
  private async processEmails() {
    // Find emails that should be sent now
    const emailsToSend = await ScheduledEmail.find({
      status: "pending",
      $or: [
        { sendNow: true },
        { sendNow: false, scheduledFor: { $lte: new Date() } },
      ],
    })
    .limit(100)
    .lean();

    if (emailsToSend.length === 0) {
      return; // Nothing to do
    }

    const BATCH_SIZE = 5;
    for (let i = 0; i < emailsToSend.length; i += BATCH_SIZE) {
      const batch = emailsToSend.slice(i, i + BATCH_SIZE);
      
      const promises = batch.map(email => this.sendSingleEmail(email));
      await Promise.allSettled(promises);
    }
  }

  private async sendSingleEmail(email: any) {
    const result = await emailService.sendEmail(email).catch(() => ({ success: false }));
    
    const updateData = result.success 
      ? { status: "sent", sentAt: new Date(), $unset: { errorMessage: 1 } }
      : { status: "failed", failedAt: new Date(), errorMessage: "Failed to send email" };

    await ScheduledEmail.findByIdAndUpdate(email._id, updateData);
  }
}

// Create and export scheduler instance
export const emailScheduler = new EmailScheduler();

emailScheduler.start();

export const scheduleEmailJob = async (email: any): Promise<string> => {
  // With this approach, we just log - the cron job will pick it up
  return email._id.toString();
};

export const cancelEmailJob = async (emailId: string): Promise<boolean> => {
  const email = await ScheduledEmail.findById(emailId);
  if (email?.status === "pending") {
    email.status = "cancelled";
    await email.save();
    return true;
  }
  return false;
};

export const retryEmailJob = async (emailId: string): Promise<string> => {
  const email = await ScheduledEmail.findById(emailId);
  if (email?.status === "failed") {
    email.status = "pending";
    email.sendNow = true; // Retry immediately
    email.errorMessage = undefined;
    await email.save();
  }
  return emailId;
};

export const initializeEmailScheduler = () => {
  emailScheduler.start();
};
