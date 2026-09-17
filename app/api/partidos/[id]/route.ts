import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { fecha, rival, esLocal, competicion, jornada, lugar, golesFavor, golesContra, notas, cerrado } = body as {
    fecha?: string;
    rival?: string;
    esLocal?: boolean;
    competicion?: string;
    jornada?: number | null;
    lugar?: string | null;
    golesFavor?: number | null;
    golesContra?: number | null;
    notas?: string | null;
    cerrado?: boolean;
  };

  if (cerrado === true) {
    const actual = await prisma.partido.findUnique({
      where: { id: params.id },
      select: { golesFavor: true, golesContra: true },
    });
    const gf = golesFavor !== undefined ? golesFavor : actual?.golesFavor;
    const gc = golesContra !== undefined ? golesContra : actual?.golesContra;
    if (gf == null || gc == null) {
      return NextResponse.json({ error: "Pon el resultado antes de cerrar la jornada." }, { status: 400 });
    }

    // Los goles de los convocados tienen que sumar el resultado — si no
    // cuadra, seguramente falta asignarle un gol a alguien (o sobra) en la
    // convocatoria, y mejor avisar ahora que dejar las estadísticas mal.
    const sumaGoles = await prisma.convocatoria.aggregate({
      where: { partidoId: params.id, convocado: true },
      _sum: { goles: true },
    });
    const golesAsignados = sumaGoles._sum.goles ?? 0;
    if (golesAsignados !== gf) {
      return NextResponse.json(
        {
          error: `Los goles asignados en la convocatoria (${golesAsignados}) no coinciden con el resultado (${gf}). Revísalo antes de cerrar.`,
        },
        { status: 400 }
      );
    }
  }

  const partido = await prisma.partido.update({
    where: { id: params.id },
    data: {
      ...(fecha !== undefined ? { fecha: new Date(fecha) } : {}),
      ...(rival !== undefined ? { rival } : {}),
      ...(esLocal !== undefined ? { esLocal } : {}),
      ...(competicion !== undefined ? { competicion } : {}),
      ...(jornada !== undefined ? { jornada } : {}),
      ...(lugar !== undefined ? { lugar } : {}),
      ...(golesFavor !== undefined ? { golesFavor } : {}),
      ...(golesContra !== undefined ? { golesContra } : {}),
      ...(notas !== undefined ? { notas } : {}),
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
