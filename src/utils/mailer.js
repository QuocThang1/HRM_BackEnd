require("dotenv").config();
const nodemailer = require("nodemailer");

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn(
      "Mailer: SMTP config not found in env, emails will be logged to console.",
    );
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
};

const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log("--- Email (simulated) ---");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Text:", text);
    console.log("HTML:", html);
    console.log("-------------------------");
    return true;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({ from, to, subject, text, html });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Mailer Error:", error);
    throw error;
  }
};

module.exports = { sendMail };
