import nodemailer from "nodemailer";

// Envío por Gmail SMTP con la cuenta del admin (contraseña de aplicación,
// ver README). Si no hay credenciales configuradas (p.ej. en local sin
// .env relleno) el envío se ignora en vez de romper la petición que lo
// dispara — el email es un aviso opcional, nunca debe bloquear nada.
const transporter =
  process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      })
    : null;

// El nombre/apodo (editable libremente en /ajustes) es texto libre — hay
// que escaparlo antes de meterlo en el HTML de un email, para que nadie
// pueda colar una etiqueta o un enlace falso en el correo que reciben los
// admins.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Aviso a los admins (no al propio usuario) cuando alguien entra por
// primera vez con Google — así saben que hay que revisar si lo pasan de
// Ayuda a Activo en /plantilla, sin tener que ir comprobando de vez en
// cuando.
export async function enviarAvisoUsuarioNuevo(
  destinatarios: string[],
  usuario: { name: string | null; email: string | null }
) {
  if (!transporter || destinatarios.length === 0) return;

  const url = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const quien = usuario.name ?? usuario.email ?? "Alguien";
  const quienHtml = escapeHtml(quien);
  const emailHtml = usuario.email ? escapeHtml(usuario.email) : null;

  try {
    await transporter.sendMail({
      from: `"Tarados Malibú" <${process.env.GMAIL_USER}>`,
      bcc: destinatarios,
      subject: "Nuevo jugador en Tarados Malibú",
      text: `${quien}${usuario.email ? ` (${usuario.email})` : ""} acaba de entrar por primera vez. Está en el grupo de Ayuda — revisa si lo pasas a Activo en ${url}/plantilla.`,
      html: `<p><strong>${quienHtml}</strong>${emailHtml ? ` (${emailHtml})` : ""} acaba de entrar por primera vez.</p><p>Está en el grupo de Ayuda — revisa si lo pasas a Activo en <a href="${url}/plantilla">${url}/plantilla</a>.</p>`,
    });
  } catch (e) {
    console.error("No se pudo enviar el aviso de jugador nuevo:", e);
  }
}
