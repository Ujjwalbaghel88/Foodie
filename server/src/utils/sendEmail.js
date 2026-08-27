import nodemailer from "nodemailer";

const hasSmtpConfig =
  (process.env.SMTP_HOST || "smtp.gmail.com") &&
  (process.env.SMTP_PORT || "587") &&
  (process.env.SMTP_USER || process.env.GMAIL_USERNAME) &&
  (process.env.SMTP_PASS || process.env.GMAIL_PASSCODE);

const createTransporter = () => {
  if (!hasSmtpConfig) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || process.env.GMAIL_USERNAME,
      pass: process.env.SMTP_PASS || process.env.GMAIL_PASSCODE,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error("Email service is not configured");
  }

  return transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.GMAIL_FROM ||
      process.env.SMTP_USER ||
      process.env.GMAIL_USERNAME ||
      "Cravings <no-reply@cravings.local>",
    to,
    subject,
    html,
    text,
  });
};
