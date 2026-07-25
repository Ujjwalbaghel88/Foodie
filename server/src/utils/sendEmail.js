import nodemailer from "nodemailer";

const hasSmtpConfig =
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS;

const createTransporter = () => {
  if (!hasSmtpConfig) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "[sendEmail] SMTP config missing. Email was not sent. OTP flow will still work in development if you read the server logs.",
    );
    return { mocked: true };
  }

  return transporter.sendMail({
    from:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      "Cravings <no-reply@cravings.local>",
    to,
    subject,
    html,
    text,
  });
};
