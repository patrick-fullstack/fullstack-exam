import nodemailer from "nodemailer";
import { IScheduledEmail } from "../models/Email";

// Email templates
const emailTemplates = {
  default: (data: any) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #f0f8f0 0%, #e8f5e8 100%);
                color: #1a4d1a;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }

            .email-wrapper {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(26, 77, 26, 0.15);
                overflow: hidden;
                border: 1px solid #c8e6c8;
            }

            .header {
                background: linear-gradient(135deg, #1a5f1a 0%, #2d4a2d 100%);
                color: #ffffff;
                padding: 40px 30px;
                text-align: center;
                position: relative;
            }

            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.15"/><circle cx="20" cy="80" r="0.5" fill="white" opacity="0.15"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }

            .header-content {
                position: relative;
                z-index: 1;
            }

            .header h1 {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 10px;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                letter-spacing: 0.5px;
            }

            .header .from-info {
                font-size: 16px;
                opacity: 0.9;
                font-weight: 300;
                margin-top: 8px;
            }

            .content {
                padding: 40px 30px;
                background: #ffffff;
            }

            .greeting {
                font-size: 20px;
                color: #1a4d1a;
                margin-bottom: 30px;
                font-weight: 500;
            }

            .message-container {
                background: linear-gradient(135deg, #f8fdf8 0%, #f0f9f0 100%);
                border-left: 4px solid #2d7a2d;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
                box-shadow: 0 2px 10px rgba(45, 122, 45, 0.1);
                position: relative;
            }

            .message-container::before {
                content: '💬';
                position: absolute;
                top: -8px;
                left: 15px;
                background: #2d7a2d;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(45, 122, 45, 0.3);
            }

            .message-text {
                font-size: 16px;
                color: #2d4a2d;
                line-height: 1.7;
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            .signature {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e6f3e6;
            }

            .signature-text {
                font-size: 16px;
                color: #1a4d1a;
                margin-bottom: 5px;
            }

            .signature-name {
                font-size: 18px;
                font-weight: 600;
                color: #2d7a2d;
                margin: 0;
            }

            .footer {
                background: linear-gradient(135deg, #1a4d1a 0%, #2d4a2d 100%);
                color: #ffffff;
                padding: 25px 30px;
                text-align: center;
                font-size: 14px;
                border-top: 1px solid #a5d6a5;
            }

            .footer-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            .footer-logo {
                font-size: 16px;
                font-weight: 600;
                color: #a5d6a5;
            }

            .footer-divider {
                color: #7ab57a;
                margin: 0 5px;
            }

            .footer-date {
                color: #c8e6c8;
                font-size: 13px;
            }

            /* Responsive Design */
            @media only screen and (max-width: 600px) {
                body {
                    padding: 10px;
                }

                .email-wrapper {
                    border-radius: 8px;
                }

                .header {
                    padding: 30px 20px;
                }

                .header h1 {
                    font-size: 24px;
                }

                .content {
                    padding: 30px 20px;
                }

                .greeting {
                    font-size: 18px;
                }

                .message-container {
                    padding: 20px;
                    margin: 20px 0;
                }

                .footer {
                    padding: 20px;
                }

                .footer-content {
                    flex-direction: column;
                    gap: 5px;
                }
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                .message-container {
                    background: linear-gradient(135deg, #0f2f0f 0%, #1a3a1a 100%);
                    color: #c8e6c8;
                }

                .message-text {
                    color: #a5d6a5;
                }
            }

            /* Print styles */
            @media print {
                body {
                    background: white;
                    padding: 0;
                }

                .email-wrapper {
                    box-shadow: none;
                    border: 1px solid #ddd;
                }

                .header {
                    background: #1a5f1a !important;
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <!-- Header Section -->
            <div class="header">
                <div class="header-content">
                    <h1>${data.subject}</h1>
                    <div class="from-info">From ${data.fromName}</div>
                </div>
            </div>

            <!-- Content Section -->
            <div class="content">
                <div class="greeting">
                    Hello ${data.toName},
                </div>

                <div class="message-container">
                    <p class="message-text">${data.message.replace(
                      /\n/g,
                      "<br>"
                    )}</p>
                </div>

                <div class="signature">
                    <p class="signature-text">Best regards,</p>
                    <p class="signature-name">${data.fromName}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,

  business: (data: any) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Arial', 'Helvetica', sans-serif;
                background: #f4f6f8;
                color: #2c3e50;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
            }

            .email-wrapper {
                max-width: 700px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                overflow: hidden;
                border: 1px solid #e1e8ed;
            }

            .header {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                color: #ffffff;
                padding: 30px 40px;
                position: relative;
            }

            .header::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
            }

            .company-logo {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
            }

            .company-name {
                font-size: 20px;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                letter-spacing: 1px;
            }

            .header-subject {
                font-size: 24px;
                font-weight: 600;
                margin: 10px 0 5px 0;
                letter-spacing: 0.3px;
                color: #ecf0f1;
            }

            .header-from {
                font-size: 14px;
                opacity: 0.85;
                font-weight: 300;
                color: #bdc3c7;
            }

            .content {
                padding: 40px;
                background: #ffffff;
            }

            .content-header {
                border-bottom: 2px solid #ecf0f1;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }

            .greeting {
                font-size: 18px;
                color: #2c3e50;
                margin-bottom: 8px;
                font-weight: 600;
            }

            .date-line {
                font-size: 14px;
                color: #7f8c8d;
                margin-bottom: 20px;
            }

            .message-container {
                background: #fafbfc;
                border: 1px solid #e1e8ed;
                border-left: 4px solid #3498db;
                padding: 30px;
                margin: 25px 0;
                border-radius: 6px;
                position: relative;
            }

            .message-container::before {
                content: '';
                position: absolute;
                top: 15px;
                right: 15px;
                width: 30px;
                height: 30px;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233498db"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>') no-repeat center;
                background-size: 20px;
                opacity: 0.3;
            }

            .message-text {
                font-size: 16px;
                color: #34495e;
                line-height: 1.7;
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            .signature {
                margin-top: 35px;
                padding-top: 25px;
                border-top: 2px solid #ecf0f1;
                background: #f8f9fa;
                padding: 25px;
                border-radius: 6px;
            }

            .signature-content {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                flex-wrap: wrap;
                gap: 20px;
            }

            .signature-left {
                flex: 1;
                min-width: 200px;
            }

            .signature-text {
                font-size: 16px;
                color: #2c3e50;
                margin-bottom: 8px;
                font-weight: 500;
            }

            .signature-name {
                font-size: 18px;
                font-weight: 700;
                color: #2c3e50;
                margin: 0 0 5px 0;
            }

            .signature-title {
                font-size: 14px;
                color: #7f8c8d;
                font-style: italic;
                margin: 0;
            }

            .signature-right {
                text-align: right;
                color: #7f8c8d;
                font-size: 13px;
            }

            .footer {
                background: #2c3e50;
                color: #ecf0f1;
                padding: 25px 40px;
                text-align: center;
                font-size: 13px;
                position: relative;
            }

            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #3498db 0%, #2980b9 50%, #3498db 100%);
            }

            .footer-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
            }

            .footer-left {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .footer-logo {
                font-size: 16px;
                font-weight: 700;
                color: #3498db;
            }

            .footer-divider {
                color: #7f8c8d;
                font-weight: 300;
            }

            .footer-right {
                color: #95a5a6;
                font-size: 12px;
            }

            /* Responsive Design */
            @media only screen and (max-width: 600px) {
                body { 
                    padding: 10px; 
                }
                
                .email-wrapper { 
                    border-radius: 4px; 
                }
                
                .header, .content, .footer { 
                    padding: 25px 20px; 
                }
                
                .header-subject { 
                    font-size: 20px; 
                }
                
                .greeting { 
                    font-size: 16px; 
                }
                
                .message-container { 
                    padding: 20px; 
                    margin: 20px 0;
                }
                
                .signature-content {
                    flex-direction: column;
                    text-align: left;
                }
                
                .signature-right {
                    text-align: left;
                }
                
                .footer-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 10px;
                }
            }

            /* Print styles */
            @media print {
                body {
                    background: white;
                    padding: 0;
                }

                .email-wrapper {
                    box-shadow: none;
                    border: 1px solid #ccc;
                }

                .header {
                    background: #2c3e50 !important;
                    -webkit-print-color-adjust: exact;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <!-- Professional Header -->
            <div class="header">
                <div class="company-logo">
                    <h2 class="company-name">MINI CRM</h2>
                </div>
                <h1 class="header-subject">${data.subject}</h1>
                <div class="header-from">From: ${data.fromName}</div>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <div class="content-header">
                    <div class="greeting">Dear ${data.toName},</div>
                    <div class="date-line">${new Date().toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}</div>
                </div>
                
                <div class="message-container">
                    <p class="message-text">${data.message.replace(
                      /\n/g,
                      "<br>"
                    )}</p>
                </div>
                
                <div class="signature">
                    <div class="signature-content">
                        <div class="signature-left">
                            <p class="signature-text">Best professional regards,</p>
                            <p class="signature-name">${data.fromName}</p>
                            <p class="signature-title">Business Representative</p>
                        </div>
                        <div class="signature-right">
                            <div>Email sent via Mini CRM</div>
                            <div>${new Date().toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `,
};

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  async sendEmail(emailData: IScheduledEmail) {
    const template =
      emailTemplates[emailData.template as keyof typeof emailTemplates] ||
      emailTemplates.default;

    const htmlContent = template({
      subject: emailData.subject,
      fromName: emailData.fromName,
      toName: emailData.toName,
      message: emailData.message,
    });

    const mailOptions = {
      from: `"${emailData.fromName}" <${emailData.fromEmail}>`,
      to: `"${emailData.toName}" <${emailData.toEmail}>`,
      subject: emailData.subject,
      html: htmlContent,
      text: `Hello ${emailData.toName},\n\n${emailData.message}\n\nBest regards,\n${emailData.fromName}`,
    };

    const result = await this.transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${emailData.toEmail}`);

    return {
      success: true,
      messageId: result.messageId,
    };
  }

  getTemplates() {
    return [
      { id: "default", name: "Default Template" },
      { id: "business", name: "Business Professional" },
    ];
  }
}

export const emailService = new EmailService();
