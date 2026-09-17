import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DISPONIBILIDADES = ["SIN_RESPONDER", "VOY", "NO_VOY", "DUDA"] as const;

// Sustituye de golpe toda la convocatoria de un partido: se manda la lista
// completa de jugadores con su estado (convocado/titular/goles/asistencias,
// y su disponibilidad) y aquí se hace upsert de cada fila. Más simple que ir
// jugador a jugador desde el cliente, y evita dejar filas sueltas si se
// desconvoca a alguien que antes sí estaba.
//
// `disponibilidad` normalmente viaja sin cambios (el admin no la toca para
// jugadores activos, que responden ellos mismos desde el partido) — la
// excepción es un jugador de ayuda, a quien el admin puede marcar "Voy" a
// mano si confirma que viene, sin que tenga que entrar él a responder.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { jugadores } = body as {
    jugadores: {
      userId: string;
      disponibilidad?: string;
      convocado: boolean;
      titular: boolean;
      goles: number;
      asistencias: number;
      tarjetaAmarilla: boolean;
      tarjetaRoja: boolean;
    }[];
  };

  if (!Array.isArray(jugadores)) {
    return NextResponse.json({ error: "Faltan datos de la convocatoria." }, { status: 400 });
  }
  if (jugadores.some((j) => j.disponibilidad !== undefined && !DISPONIBILIDADES.includes(j.disponibilidad as any))) {
    return NextResponse.json({ error: "Disponibilidad no válida." }, { status: 400 });
  }

  await prisma.$transaction(
    jugadores.map((j) =>
      prisma.convocatoria.upsert({
        where: { partidoId_userId: { partidoId: params.id, userId: j.userId } },
        update: {
          ...(j.disponibilidad !== undefined ? { disponibilidad: j.disponibilidad as any } : {}),
          convocado: j.convocado,
          titular: j.titular,
          goles: j.goles,
          asistencias: j.asistencias,
          tarjetaAmarilla: j.tarjetaAmarilla,
          tarjetaRoja: j.tarjetaRoja,
        },
        create: {
          partidoId: params.id,
          userId: j.userId,
          disponibilidad: (j.disponibilidad as any) ?? "SIN_RESPONDER",
          convocado: j.convocado,
          titular: j.titular,
          goles: j.goles,
          asistencias: j.asistencias,
          tarjetaAmarilla: j.tarjetaAmarilla,
          tarjetaRoja: j.tarjetaRoja,
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
