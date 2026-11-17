import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_EMAILS } from "@/lib/auth";
import { enviarRecordatorioConvocatoria } from "@/lib/email";
import { inicioSemanaMadrid } from "@/lib/fechas";

// Vercel pone esta variable en el servidor: "production" solo en el
// despliegue real (ver app/api/partidos/route.ts para el mismo patrón).
const ES_PRODUCCION = process.env.VERCEL_ENV === "production";

// Lo llama Vercel Schedules (ver vercel.json) cada miércoles a las 12:30
// hora de Madrid — Vercel ya aplica el huso horario y el cambio CET/CEST,
// así que aquí no hace falta volver a comprobar el día ni la hora (mismo
// patrón que app/api/cron/diario de EuroAmigus).
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const ahora = new Date();

  // Mismo partido que se enseña como "próximo" en toda la app.
  const proximoPartido = await prisma.partido.findFirst({
    where: { cerrado: false },
    orderBy: { fecha: "asc" },
    include: { convocatorias: { select: { userId: true, disponibilidad: true } } },
  });
  if (!proximoPartido) {
    return NextResponse.json({ ok: true, enviado: false, motivo: "No hay próximo partido." });
  }
  // Solo se manda el miércoles de la misma semana del partido (lunes a
  // domingo) — si el partido cae más adelante, toca esperar al miércoles
  // de esa semana, no avisar ya desde hoy.
  if (inicioSemanaMadrid(ahora) !== inicioSemanaMadrid(proximoPartido.fecha)) {
    return NextResponse.json({ ok: true, enviado: false, motivo: "El próximo partido no es esta semana." });
  }

  const jugadores = await prisma.user.findMany({
    where: { rol: "JUGADOR" },
    select: { id: true, email: true, emailNotificaciones: true },
  });
  const respondidosIds = new Set(
    proximoPartido.convocatorias.filter((c) => c.disponibilidad !== "SIN_RESPONDER").map((c) => c.userId)
  );
  const sinResponder = jugadores.filter((j) => !respondidosIds.has(j.id));

  const destinatariosReales = sinResponder.map((j) => j.emailNotificaciones ?? j.email).filter((e): e is string => !!e);
  const destinatarios = ES_PRODUCCION
    ? destinatariosReales
    : jugadores
        .filter((j) => ADMIN_EMAILS.includes((j.email ?? "").toLowerCase()))
        .map((j) => j.emailNotificaciones ?? j.email)
        .filter((e): e is string => !!e);

  if (destinatarios.length === 0) {
    return NextResponse.json({ ok: true, enviado: false, motivo: "Nadie pendiente de responder." });
  }

  await enviarRecordatorioConvocatoria(destinatarios, {
    id: proximoPartido.id,
    rival: proximoPartido.rival,
    esLocal: proximoPartido.esLocal,
    fecha: proximoPartido.fecha,
    competicion: proximoPartido.competicion,
    jornada: proximoPartido.jornada,
  });

  // Se registra lo que de verdad pasó (cuántos estaban sin responder), no
  // cuántos han recibido el correo de verdad — en local/preview eso
  // siempre son los admins, no el número real, y confundiría ver "2
  // destinatarios" cuando en realidad eran 7 los pendientes.
  await prisma.recordatorioEnviado.create({
    data: { partidoId: proximoPartido.id, destinatarios: sinResponder.length },
  });

  return NextResponse.json({ ok: true, enviado: true, destinatarios: sinResponder.length });
}
