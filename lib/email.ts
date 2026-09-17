import nodemailer from "nodemailer";
import { formatFechaHora } from "@/lib/fechas";

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

// Aviso a todo el equipo cuando el admin crea un partido nuevo, para que
// entren a decir si van, no van o dudan. Quién recibe realmente el correo
// (todo el equipo en producción, o solo el propio admin en local/preview)
// lo decide quien llama a esta función — ver app/api/partidos/route.ts.
export async function enviarAvisoNuevoPartido(
  destinatarios: string[],
  partido: {
    id: string;
    rival: string;
    esLocal: boolean;
    fecha: Date;
    competicion: string;
    jornada: number | null;
    lugar: string | null;
  }
) {
  if (!transporter || destinatarios.length === 0) return;

  const url = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const rivalHtml = escapeHtml(partido.rival);
  const contra = partido.esLocal ? `vs ${partido.rival}` : `@ ${partido.rival}`;
  const contraHtml = partido.esLocal ? `vs ${rivalHtml}` : `@ ${rivalHtml}`;
  const detalle = `${partido.competicion}${partido.jornada !== null ? ` · Jornada ${partido.jornada}` : ""}`;
  const detalleHtml = escapeHtml(detalle);
  const enlace = `${url}/calendario/${partido.id}`;

  try {
    await transporter.sendMail({
      from: `"Tarados Malibú" <${process.env.GMAIL_USER}>`,
      bcc: destinatarios,
      subject: `Nuevo partido: ${contra}`,
      text: `Se ha creado un partido nuevo: ${contra}\n${formatFechaHora(partido.fecha)} · ${detalle}${partido.lugar ? ` · ${partido.lugar}` : ""}\n\nEntra en ${enlace} y di si vas, no vas o dudas.`,
      html: `<p>Se ha creado un partido nuevo: <strong>${contraHtml}</strong></p><p>${formatFechaHora(partido.fecha)} · ${detalleHtml}${partido.lugar ? ` · ${escapeHtml(partido.lugar)}` : ""}</p><p><a href="${enlace}">Entra aquí</a> y di si vas, no vas o dudas.</p>`,
    });
  } catch (e) {
    console.error("No se pudo enviar el aviso de partido nuevo:", e);
  }
}
