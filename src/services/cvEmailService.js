const nodemailer = require("nodemailer");

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASS,
            },
        });

        this.transporter.verify((error) => {
            if (error) {
                console.error(" Email service error:", error);
            }
        });
    }

    async sendEmail({ to, subject, html, text }) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: to,
                subject: subject,
                html: html,
                text: text || "",
            };

            const info = await this.transporter.sendMail(mailOptions);

            return {
                success: true,
                messageId: info.messageId,
                message: "Email sent successfully",
            };
        } catch (error) {
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendCVApprovedEmail(candidateData) {
        const { email, fullName } = candidateData;

        const subject = " Congratulations! Your CV Has Been Approved - Nextgen HRM System";

        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 10px;
    }
    .header {
      background-color: #4CAF50;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
    }
    .content h2 {
      color: #4CAF50;
      margin-top: 0;
    }
    .highlight-box {
      background-color: #e8f5e9;
      border-left: 4px solid #4CAF50;
      padding: 20px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    ul {
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1> Congratulations!</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Your CV Application Has Been Approved</p>
    </div>
    <div class="content">
      <h2>Dear ${fullName},</h2>
      
      <p>
        We are delighted to inform you that your CV application has been <strong>APPROVED</strong>!
      </p>

      <div class="highlight-box">
        <strong> Your application status: APPROVED</strong><br>
        <p style="margin: 10px 0 0 0;">
          Our HR team has carefully reviewed your qualifications and we are impressed with your background and experience.
        </p>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Our HR team will contact you within <strong>3-5 business days</strong> via phone or email</li>
        <li>Please prepare for the interview process and gather any necessary documents</li>
        <li>Keep your phone and email available for our communication</li>
        <li>You may receive additional information about the interview schedule</li>
      </ul>

      <p>
        We look forward to meeting you in person and discussing this exciting opportunity further!
      </p>

      <p style="margin-top: 30px;">
        <strong>Best regards,</strong><br>
        The Nextgen HRM System Team
      </p>
    </div>
    <div class="footer">
      <p>This is an automated email notification. Please do not reply to this message.</p>
      <p>&copy; 2025 Nextgen HRM System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

        return await this.sendEmail({
            to: email,
            subject: subject,
            html: html,
        });
    }


    async sendCVRejectedEmail(candidateData, rejectionReason = null) {
        const { email, fullName } = candidateData;

        const subject = "CV Application Status Update - Nextgen HRM System";
        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 10px;
    }
    .header {
      background-color: #f44336;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
    }
    .reason-box {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 20px 0;
    }
    .reason-box strong {
      color: #856404;
    }
    ul {
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Status Update</h1>
    </div>
    <div class="content">
      <h2>Dear ${fullName},</h2>
      
      <p>
        Thank you for your interest in joining our company and for taking the time to submit your CV application.
      </p>

      <p>
        After careful review of your application, we regret to inform you that we will <strong>not be moving forward</strong> with your candidacy at this time.
      </p>

      ${rejectionReason
                ? `
      <div class="reason-box">
        <strong>Reason for rejection:</strong><br>
        <p style="margin: 10px 0 0 0;">${rejectionReason}</p>
      </div>
      `
                : ""
            }

      <p><strong>We encourage you to:</strong></p>
      <ul>
        <li>Review and update your CV with more detailed information</li>
        <li>Ensure all required fields are complete and accurate</li>
        <li>Apply for other positions that better match your qualifications</li>
        <li>Continue developing your skills and gaining relevant experience</li>
      </ul>

      <p>
        We appreciate your interest in our company and wish you the very best in your job search and future career endeavors.
      </p>

      <p style="margin-top: 30px;">
        <strong>Best regards,</strong><br>
        The Nextgen HRM System Team
      </p>
    </div>
    <div class="footer">
      <p>This is an automated email notification. Please do not reply to this message.</p>
      <p>&copy; 2025 Nextgen HRM System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

        return await this.sendEmail({
            to: email,
            subject: subject,
            html: html,
        });
    }


    async sendCVPendingEmail(candidateData) {
        const { email, fullName } = candidateData;

        const subject = " CV Application Received - Nextgen HRM System";
        const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 10px;
    }
    .header {
      background-color: #2196F3;
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 0 0 10px 10px;
    }
    .info-box {
      background-color: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding: 20px;
      margin: 20px 0;
    }
    ul {
      padding-left: 20px;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Application Received</h1>
    </div>
    <div class="content">
      <h2>Dear ${fullName},</h2>
      
      <p>
        Thank you for submitting your CV application to our company!
      </p>

      <div class="info-box">
        <strong> Your CV has been successfully received and is now under review.</strong>
      </div>

      <p><strong>What happens next?</strong></p>
      <ul>
        <li>Your CV will be carefully reviewed by our HR team within <strong>3-5 business days</strong></li>
        <li>You will receive an email notification about your application status</li>
        <li>If your CV is approved, we will contact you for the next steps in the hiring process</li>
        <li>Please ensure your contact information is up to date</li>
      </ul>

      <p>
        <strong>Application Details:</strong>
      </p>
      <ul style="list-style: none; padding-left: 0;">
        <li>📌 <strong>Status:</strong> Pending Review</li>
        <li>📅 <strong>Submitted:</strong> ${new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })}</li>
      </ul>

      <p>
        Thank you for your patience. We appreciate your interest in joining our team!
      </p>

      <p style="margin-top: 30px;">
        <strong>Best regards,</strong><br>
        The Nextgen HRM System Team
      </p>
    </div>
    <div class="footer">
      <p>This is an automated email notification. Please do not reply to this message.</p>
      <p>&copy; 2025 Nextgen HRM System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

        return await this.sendEmail({
            to: email,
            subject: subject,
            html: html,
        });
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            return { success: true, message: "Email service is ready" };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = new EmailService();