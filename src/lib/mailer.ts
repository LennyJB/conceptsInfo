import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  return transporter;
}

/**
 * Envoie un email si SMTP_HOST est configuré. Sinon ne fait rien : l'envoi
 * d'email est une fonctionnalité optionnelle (voir README).
 */
export async function sendMail(options: { to: string; subject: string; text: string }) {
  const client = getTransporter();
  if (!client) return;

  try {
    await client.sendMail({
      from: process.env.SMTP_FROM || "Coachella <no-reply@coachella.local>",
      ...options,
    });
  } catch (err) {
    console.error("Échec de l'envoi d'email:", err);
  }
}
