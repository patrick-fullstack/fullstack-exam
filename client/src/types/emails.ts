// Email interfaces
export interface CreateEmailData {
  fromName: string;
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  template: string;
  sendNow: boolean;
  scheduledFor?: string;
}

export interface ScheduledEmail {
  _id: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  subject: string;
  message: string;
  template: string;
  sendNow: boolean;
  scheduledFor?: string;
  status: "pending" | "sent" | "failed" | "cancelled";
  sentAt?: string;
  failedAt?: string;
  errorMessage?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  companyId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
}

// API Response interfaces
export interface EmailsResponse {
  success: boolean;
  message: string;
  data: {
    emails: ScheduledEmail[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalEmails: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
  };
}

export interface CreateEmailResponse {
  success: boolean;
  message: string;
  data: {
    email: ScheduledEmail;
  };
}

export interface TemplatesResponse {
  success: boolean;
  message: string;
  data: {
    templates: EmailTemplate[];
  };
}

export interface EmailActionResponse {
  success: boolean;
  message: string;
  data?: {
    email: ScheduledEmail;
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export interface EmailListProps {
  onError: (error: string) => void;
  refreshTrigger?: number;
}

export interface EmailFormProps {
  onSubmit: (emailData: CreateEmailData) => Promise<void>;
  loading?: boolean;
  error?: string;
  resetForm?: boolean;
}
