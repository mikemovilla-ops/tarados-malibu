import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, ADMIN_EMAILS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enviarAvisoNuevoPartido } from "@/lib/email";

// Vercel pone esta variable en el servidor: "production" solo en el
// despliegue real, "preview" en ramas como develop, y no existe en local.
// Así evitamos avisar por email a todo el equipo mientras se está
// probando/desarrollando — en esos casos, el correo (si se manda) va solo
// a los admins.
const ES_PRODUCCION = process.env.VERCEL_ENV === "production";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { fecha, rival, esLocal, competicion, jornada, lugar } = body as {
    fecha: string;
    rival: string;
    esLocal: boolean;
    competicion?: string;
    jornada?: number | null;
    lugar?: string;
  };

  if (!fecha || !rival) {
    return NextResponse.json({ error: "Faltan datos del partido." }, { status: 400 });
  }

  const partido = await prisma.partido.create({
    data: {
      fecha: new Date(fecha),
      rival,
      esLocal: !!esLocal,
      competicion: competicion || "Liga",
      jornada: jornada ?? null,
      lugar: lugar || null,
    },
  });

  const jugadores = await prisma.user.findMany({
    where: { email: { not: null } },
    select: { email: true, emailNotificaciones: true },
  });
  const destinatarios = (
    ES_PRODUCCION ? jugadores : jugadores.filter((u) => ADMIN_EMAILS.includes((u.email ?? "").toLowerCase()))
  )
    .map((u) => u.emailNotificaciones ?? u.email)
    .filter((e): e is string => !!e);
  await enviarAvisoNuevoPartido(destinatarios, {
    id: partido.id,
    rival: partido.rival,
    esLocal: partido.esLocal,
    fecha: partido.fecha,
    competicion: partido.competicion,
    jornada: partido.jornada,
    lugar: partido.lugar,
  });

  return NextResponse.json({ ok: true, partido });
}
