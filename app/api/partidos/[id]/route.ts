import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseInputDatetimeLocalMadrid } from "@/lib/fechas";

// Mayoría de votos para un premio: si hay un único candidato con más votos
// que el resto, gana; si hay empate (o nadie ha votado), se devuelve null y
// lo decide el admin a mano con el selector.
async function ganadorPorVotos(partidoId: string, tipo: "ESSENZAL" | "VAYA_DIA"): Promise<string | null> {
  const votos = await prisma.votoPremio.groupBy({
    by: ["candidatoId"],
    where: { partidoId, tipo },
    _count: { candidatoId: true },
  });
  if (votos.length === 0) return null;
  const maxVotos = Math.max(...votos.map((v) => v._count.candidatoId));
  const ganadores = votos.filter((v) => v._count.candidatoId === maxVotos);
  return ganadores.length === 1 ? ganadores[0].candidatoId : null;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const {
    fecha,
    rival,
    esLocal,
    competicion,
    jornada,
    lugar,
    golesFavor,
    golesContra,
    golesPropiaPuerta,
    notas,
    fotoUrl,
    jugadorEssenzalId,
    jugadorEssenzalMotivo,
    jugadorVayaDiaId,
    jugadorVayaDiaMotivo,
    cerrado,
  } = body as {
    fecha?: string;
    rival?: string;
    esLocal?: boolean;
    competicion?: string;
    jornada?: number | null;
    lugar?: string | null;
    golesFavor?: number | null;
    golesContra?: number | null;
    golesPropiaPuerta?: number;
    notas?: string | null;
    fotoUrl?: string | null;
    jugadorEssenzalId?: string | null;
    jugadorEssenzalMotivo?: string | null;
    jugadorVayaDiaId?: string | null;
    jugadorVayaDiaMotivo?: string | null;
    cerrado?: boolean;
  };

  let essenzalIdFinal = jugadorEssenzalId;
  let vayaDiaIdFinal = jugadorVayaDiaId;

  if (cerrado === true) {
    const actual = await prisma.partido.findUnique({
      where: { id: params.id },
      select: {
        golesFavor: true,
        golesContra: true,
        golesPropiaPuerta: true,
        jugadorEssenzalId: true,
        jugadorVayaDiaId: true,
      },
    });
    const gf = golesFavor !== undefined ? golesFavor : actual?.golesFavor;
    const gc = golesContra !== undefined ? golesContra : actual?.golesContra;
    const gpp = golesPropiaPuerta !== undefined ? golesPropiaPuerta : actual?.golesPropiaPuerta ?? 0;
    if (gf == null || gc == null) {
      return NextResponse.json({ error: "Pon el resultado antes de cerrar la jornada." }, { status: 400 });
    }

    // Los goles de los convocados, más los que nos haya metido el rival en
    // propia puerta (no van a la cuenta de ningún jugador nuestro), tienen
    // que sumar el resultado — si no cuadra, seguramente falta asignarle un
    // gol a alguien (o sobra) en la convocatoria, y mejor avisar ahora que
    // dejar las estadísticas mal.
    const sumaGoles = await prisma.convocatoria.aggregate({
      where: { partidoId: params.id, convocado: true },
      _sum: { goles: true },
    });
    const golesAsignados = (sumaGoles._sum.goles ?? 0) + gpp;
    if (golesAsignados !== gf) {
      return NextResponse.json(
        {
          error: `Los goles asignados en la convocatoria más los de propia puerta (${golesAsignados}) no coinciden con el resultado (${gf}). Revísalo antes de cerrar.`,
        },
        { status: 400 }
      );
    }

    // Al cerrar: si el admin no ha elegido ya un premio a mano (ni en esta
    // misma petición ni antes), se rellena con quien gane la votación de
    // los convocados. Empate o sin votos = se queda sin ganador, para que
    // el admin lo decida él con el selector.
    if (essenzalIdFinal === undefined && actual?.jugadorEssenzalId == null) {
      essenzalIdFinal = await ganadorPorVotos(params.id, "ESSENZAL");
    }
    if (vayaDiaIdFinal === undefined && actual?.jugadorVayaDiaId == null) {
      vayaDiaIdFinal = await ganadorPorVotos(params.id, "VAYA_DIA");
    }
  }

  const partido = await prisma.partido.update({
    where: { id: params.id },
    data: {
      ...(fecha !== undefined ? { fecha: parseInputDatetimeLocalMadrid(fecha) } : {}),
      ...(rival !== undefined ? { rival } : {}),
      ...(esLocal !== undefined ? { esLocal } : {}),
      ...(competicion !== undefined ? { competicion } : {}),
      ...(jornada !== undefined ? { jornada } : {}),
      ...(lugar !== undefined ? { lugar } : {}),
      ...(golesFavor !== undefined ? { golesFavor } : {}),
      ...(golesContra !== undefined ? { golesContra } : {}),
      ...(golesPropiaPuerta !== undefined ? { golesPropiaPuerta } : {}),
      ...(notas !== undefined ? { notas } : {}),
      ...(fotoUrl !== undefined ? { fotoUrl } : {}),
      ...(essenzalIdFinal !== undefined ? { jugadorEssenzalId: essenzalIdFinal } : {}),
      ...(jugadorEssenzalMotivo !== undefined ? { jugadorEssenzalMotivo } : {}),
      ...(vayaDiaIdFinal !== undefined ? { jugadorVayaDiaId: vayaDiaIdFinal } : {}),
      ...(jugadorVayaDiaMotivo !== undefined ? { jugadorVayaDiaMotivo } : {}),
      ...(cerrado !== undefined ? { cerrado } : {}),
    },
  });

  return NextResponse.json({ ok: true, partido });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  await prisma.partido.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
