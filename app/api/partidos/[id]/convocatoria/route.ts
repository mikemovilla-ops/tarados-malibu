import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Sustituye de golpe toda la convocatoria de un partido: se manda la lista
// completa de jugadores con su estado (convocado/titular/goles/asistencias)
// y aquí se hace upsert de cada fila. Más simple que ir jugador a jugador
// desde el cliente, y evita dejar filas sueltas si se desconvoca a alguien
// que antes sí estaba.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { jugadores } = body as {
    jugadores: {
      userId: string;
      convocado: boolean;
      titular: boolean;
      goles: number;
      asistencias: number;
    }[];
  };

  if (!Array.isArray(jugadores)) {
    return NextResponse.json({ error: "Faltan datos de la convocatoria." }, { status: 400 });
  }

  await prisma.$transaction(
    jugadores.map((j) =>
      prisma.convocatoria.upsert({
        where: { partidoId_userId: { partidoId: params.id, userId: j.userId } },
        update: {
          convocado: j.convocado,
          titular: j.titular,
          goles: j.goles,
          asistencias: j.asistencias,
        },
        create: {
          partidoId: params.id,
          userId: j.userId,
          convocado: j.convocado,
          titular: j.titular,
          goles: j.goles,
          asistencias: j.asistencias,
        },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
