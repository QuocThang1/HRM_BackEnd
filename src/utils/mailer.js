const nodemailer = require("nodemailer");

// Normalize credentials from env (trim and remove accidental spaces)
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_APP_PASS = (process.env.EMAIL_APP_PASS || "").replace(/\s/g, "");

// Create primary transporter (Gmail)
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_APP_PASS,
  },
});

const verifyTransporter = () => {
  transporter.verify((err, success) => {
    if (err) {
      console.error("Mailer transporter verification failed:", err);
    }
  });
};

verifyTransporter();

const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  const t = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  return { transporter: t, testAccount };
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: EMAIL_USER || process.env.EMAIL_USER || "no-reply@example.com",
    to,
    subject,
    text,
    html,
  };

  // Try primary transporter first
  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error("Primary transporter sendMail failed:", err);

    // If in development or explicitly forced, fallback to Ethereal so we can inspect
    const forceEthereal = process.env.FORCE_ETHEREAL === "true";
    const isDev = process.env.NODE_ENV !== "production";
    if (!isDev && !forceEthereal) {
      // Re-throw for production to let caller handle
      throw err;
    }

    try {
      const { transporter: ethTrans } = await createEtherealTransporter();
      const info = await ethTrans.sendMail(mailOptions);
      const preview = nodemailer.getTestMessageUrl(info);
      return info;
    } catch (ethErr) {
      console.error("Ethereal fallback also failed:", ethErr);
      throw ethErr;
    }
  }
};

module.exports = { sendMail, verifyTransporter };
