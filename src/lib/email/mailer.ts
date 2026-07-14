import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });

  return transporter;
}

export interface SendMailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendMail({ to, subject, html, text }: SendMailInput) {
  if (!process.env.SMTP_HOST) {
    console.warn(
      `[email] SMTP_HOST not configured — skipping send of "${subject}" to ${to}`
    );
    return { skipped: true } as const;
  }

  const info = await getTransporter().sendMail({
    from: process.env.SMTP_FROM ?? "JNV Smart Connect <no-reply@jnvsmartconnect.in>",
    to,
    subject,
    html,
    text,
  });

  return { skipped: false, messageId: info.messageId } as const;
}
