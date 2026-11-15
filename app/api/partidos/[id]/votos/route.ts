import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TIPOS = ["ESSENZAL", "VAYA_DIA"] as const;

// Puede votar cualquier convocado, y también un socio que el admin haya
// confirmado como asistente al partido (ver AsistenciaSociosEditor) — en
// los dos casos mientras la jornada siga abierta, y puede cambiar su voto
// tantas veces como quiera hasta entonces (upsert). Al cerrar la jornada
// (/api/partidos/[id]) se cuenta la mayoría para rellenar el premio.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { tipo, candidatoId } = (await req.json()) as { tipo: string; candidatoId: string };
  if (!TIPOS.includes(tipo as any) || !candidatoId) {
    return NextResponse.json({ error: "Voto no válido." }, { status: 400 });
  }

  const partido = await prisma.partido.findUnique({
    where: { id: params.id },
    select: {
      cerrado: true,
      convocatorias: { where: { convocado: true }, select: { userId: true } },
      asistenciasSocio: { where: { confirmado: true }, select: { userId: true } },
    },
  });
  if (!partido) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }
  if (partido.cerrado) {
    return NextResponse.json({ error: "La jornada ya está cerrada, no se puede votar." }, { status: 400 });
  }

  const convocadosIds = new Set(partido.convocatorias.map((c) => c.userId));
  const asistentesConfirmadosIds = new Set(partido.asistenciasSocio.map((a) => a.userId));
  if (!convocadosIds.has(session.user.id) && !asistentesConfirmadosIds.has(session.user.id)) {
    return NextResponse.json(
      { error: "Solo pueden votar los convocados y los socios confirmados como asistentes." },
      { status: 403 }
    );
  }
  if (!convocadosIds.has(candidatoId)) {
    return NextResponse.json({ error: "Solo se puede votar a un convocado." }, { status: 400 });
  }
  // A "mejor jugador" no te puedes votar a ti mismo (sí al peor, que para
  // eso tiene gracia).
  if (tipo === "ESSENZAL" && candidatoId === session.user.id) {
    return NextResponse.json({ error: "No puedes votarte a ti mismo a Jugador Essenzal." }, { status: 400 });
  }

  await prisma.votoPremio.upsert({
    where: { partidoId_votanteId_tipo: { partidoId: params.id, votanteId: session.user.id, tipo: tipo as any } },
    update: { candidatoId },
    create: { partidoId: params.id, votanteId: session.user.id, candidatoId, tipo: tipo as any },
  });

  return NextResponse.json({ ok: true });
}
