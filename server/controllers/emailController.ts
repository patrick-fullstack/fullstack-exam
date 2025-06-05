import { Request, Response } from "express";
import { ScheduledEmail, IScheduledEmail } from "../models/Email";
import { UserRole } from "../models/User";
import { asyncHandler } from "../middlewares/errorHandler";
import { emailService } from "../services/emailService";
import {
  scheduleEmailJob,
  cancelEmailJob,
  retryEmailJob,
} from "../services/emailScheduler";

// Create scheduled email
export const createScheduledEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUser = req.user!;
    const {
      fromName,
      //   fromEmail,
      toName,
      toEmail,
      subject,
      message,
      template,
      sendNow,
      scheduledFor,
    } = req.body;

    // Simple validation
    if (
      !fromName ||
      //   !fromEmail ||
      !toName ||
      !toEmail ||
      !subject ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All email fields are required",
      });
    }

    // Check if scheduled date is valid
    if (!sendNow && (!scheduledFor || new Date(scheduledFor) <= new Date())) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date must be in the future",
      });
    }

    // Create email data
    const emailData: Partial<IScheduledEmail> = {
      fromName,
      fromEmail: currentUser.email,
      toName,
      toEmail,
      subject,
      message,
      template: template || "default",
      sendNow,
      scheduledFor: sendNow ? undefined : new Date(scheduledFor),
      createdBy: currentUser._id,
      companyId:
        currentUser.role === UserRole.MANAGER
          ? currentUser.companyId
          : undefined,
    };

    // Save to database
    const scheduledEmail = await ScheduledEmail.create(emailData);

    // Schedule the job
    const jobId = await scheduleEmailJob(scheduledEmail);

    res.status(201).json({
      success: true,
      message: sendNow
        ? "Email queued for immediate sending"
        : "Email scheduled successfully",
      data: {
        email: scheduledEmail,
        jobId,
      },
    });
  }
);

// Get all scheduled emails with pagination
export const getScheduledEmails = asyncHandler(
  async (req: Request, res: Response) => {
    const currentUser = req.user!;
    const { page = 1, limit = 10, status } = req.query;

    // Build filter based on user role
    let filter: any = {};

    if (currentUser.role === UserRole.SUPER_ADMIN) {
      // Super admin sees all emails
    } else if (currentUser.role === UserRole.MANAGER) {
      // Manager sees emails from their company
      filter.$or = [
        { createdBy: currentUser._id },
        { companyId: currentUser.companyId },
      ];
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Pagination setup
    const pageNumber = Math.max(1, parseInt(page as string));
    const limitNumber = Math.max(1, parseInt(limit as string));
    const skip = (pageNumber - 1) * limitNumber;

    // Get emails and count
    const [totalEmails, emails] = await Promise.all([
      ScheduledEmail.countDocuments(filter),
      ScheduledEmail.find(filter)
        .populate("createdBy", "firstName lastName email")
        .populate("companyId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),
    ]);

    res.status(200).json({
      success: true,
      data: {
        emails,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalEmails / limitNumber),
          totalEmails,
          hasNextPage: pageNumber < Math.ceil(totalEmails / limitNumber),
          hasPrevPage: pageNumber > 1,
        },
      },
    });
  }
);

// Get single email by ID
export const getEmailById = asyncHandler(
  async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const currentUser = req.user!;

    const email = await ScheduledEmail.findById(emailId)
      .populate("createdBy", "firstName lastName email")
      .populate("companyId", "name");

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    // Check permissions
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      email.createdBy.toString() !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: { email },
    });
  }
);

// Cancel scheduled email
export const cancelScheduledEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { emailId } = req.params;
    const currentUser = req.user!;

    const email = await ScheduledEmail.findById(emailId);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }

    // Check permissions
    if (
      currentUser.role !== UserRole.SUPER_ADMIN &&
      email.createdBy.toString() !== currentUser._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (email.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Can only cancel pending emails",
      });
    }

    // Cancel the email
    const cancelled = await cancelEmailJob(emailId);

    res.status(200).json({
      success: true,
      message: "Email cancelled successfully",
      data: { cancelled },
    });
  }
);

// Retry failed email
export const retryEmail = asyncHandler(async (req: Request, res: Response) => {
  const { emailId } = req.params;
  const currentUser = req.user!;

  const email = await ScheduledEmail.findById(emailId);

  if (!email) {
    return res.status(404).json({
      success: false,
      message: "Email not found",
    });
  }

  // Check permissions
  if (
    currentUser.role !== UserRole.SUPER_ADMIN &&
    email.createdBy.toString() !== currentUser._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  if (email.status !== "failed") {
    return res.status(400).json({
      success: false,
      message: "Can only retry failed emails",
    });
  }

  // Retry the email
  const jobId = await retryEmailJob(emailId);

  res.status(200).json({
    success: true,
    message: "Email queued for retry",
    data: { jobId },
  });
});

// Get available email templates
export const getEmailTemplates = asyncHandler(
  async (req: Request, res: Response) => {
    const templates = emailService.getTemplates();

    res.status(200).json({
      success: true,
      data: { templates },
    });
  }
);
