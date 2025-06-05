import cron from "node-cron";
import { ScheduledEmail } from "../models/Email";
import { emailService } from "./emailService";

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

      this.isProcessing = true;
      await this.processEmails();
      this.isProcessing = false;
    });

    this.isInitialized = true;
    console.log("Email scheduler started");
  }

  // Process emails that are ready to be sent
  private async processEmails() {
    const now = new Date();

    // Find emails that should be sent now
    const emailsToSend = await ScheduledEmail.find({
      status: "pending",
      $or: [
        { sendNow: true }, // Immediate emails
        { sendNow: false, scheduledFor: { $lte: now } }, // Scheduled emails due now
      ],
    }).limit(100); // Process max 5 emails per minute to avoid overwhelming

    if (emailsToSend.length === 0) {
      return; // Nothing to do
    }

    await this.sendEmailsInParallel(emailsToSend);
  }

  //   Send emails in parallel, 10 at a time
  private async sendEmailsInParallel(emails: any[]) {
    const CONCURRENT_EMAILS = 10; // Send 10 emails simultaneously

    // Split emails into chunks of 10
    for (let i = 0; i < emails.length; i += CONCURRENT_EMAILS) {
      const chunk = emails.slice(i, i + CONCURRENT_EMAILS);

      // Send this chunk in parallel
      const promises = chunk.map((email) => this.sendSingleEmail(email));
      await Promise.allSettled(promises); // Won't fail if one email fails
    }
  }

  // Send a single email and update its status
  private async sendSingleEmail(email: any) {
    const result = await emailService.sendEmail(email);

    // Update email status based on result
    if (result.success) {
      email.status = "sent";
      email.sentAt = new Date();
    } else {
      email.status = "failed";
      email.failedAt = new Date();
      email.errorMessage = "Failed to send email";
    }

    await email.save();
  }
}

// Create and export scheduler instance
export const emailScheduler = new EmailScheduler();

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

// This starts the scheduler when the module is imported
emailScheduler.start();
