const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_APP_PASS = (process.env.EMAIL_APP_PASS || "").trim();
const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();

const isProd = process.env.NODE_ENV === "production";

// Resend client for production
let resendClient = null;
if (isProd && RESEND_API_KEY) {
  resendClient = new Resend(RESEND_API_KEY);
}

// Gmail SMTP (only for development)
let transporter = null;

if (!isProd) {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_APP_PASS,
      },
    });

    transporter.verify((err) => {
      if (err) console.warn("Gmail transporter unavailable:", err.message);
    });
  } catch (err) {
    console.warn("Could not initialize email transporter:", err.message);
  }
}

// Dev-only Ethereal
const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendMail = async ({ to, subject, text, html }) => {
  // PRODUCTION — use Resend
  if (isProd) {
    if (!resendClient) {
      console.warn("⚠️ Resend not configured. Set RESEND_API_KEY in env.");
      return { message: "Email service not configured" };
    }

    try {
      const fromEmail = "HRM System <onboarding@resend.dev>";
      const payload = {
        from: fromEmail,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: html || (text ? `<pre>${text}</pre>` : "<em>No content</em>"),
        text: text || (html ? html.replace(/<[^>]+>/g, " ").trim() : ""),
      };
      const data = await resendClient.emails.send(payload);
      const id = (data && data.id) || (data?.data && data.data.id) || null;
      console.log("🔎 Resend raw response:", JSON.stringify(data));
      console.log("✅ Email sent via Resend:", id ?? "no id returned");
      return { id, raw: data };
    } catch (err) {
      console.error("❌ Resend error:", err.message);
      throw err;
    }
  }

  // Try Gmail
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      return info;
    } catch (err) {
      console.warn("Gmail send failed:", err.message);
    }
  }

  // Fallback: Ethereal (dev only)
  try {
    const eth = await createEtherealTransporter();
    const info = await eth.sendMail({
      from: "no-reply@test.dev",
      to,
      subject,
      text,
      html,
    });
    return info;
  } catch (err) {
    console.warn("Ethereal fallback failed:", err.message);
    throw err;
  }
};

module.exports = { sendMail };
