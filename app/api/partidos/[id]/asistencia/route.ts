import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarEvento } from "@/lib/eventos";
import { nombreMostrado } from "@/lib/jugadores";

// Un socio se autodeclara "voy a ver este partido" — solo una intención,
// igual que responder disponibilidad; el admin es quien la confirma de
// verdad con el PATCH de aquí abajo (ver AsistenciaSociosEditor).
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { rol: true, name: true, apodo: true },
  });
  if (usuario?.rol !== "SOCIO") {
    return NextResponse.json({ error: "Solo los socios pueden declarar que van a ver un partido." }, { status: 403 });
  }

  const { declarado } = (await req.json()) as { declarado: boolean };

  const partido = await prisma.partido.findUnique({ where: { id: params.id }, select: { cerrado: true } });
  if (!partido) {
    return NextResponse.json({ error: "Partido no encontrado." }, { status: 404 });
  }
  if (partido.cerrado) {
    return NextResponse.json({ error: "La jornada ya está cerrada." }, { status: 400 });
  }

  await prisma.asistenciaSocio.upsert({
    where: { partidoId_userId: { partidoId: params.id, userId: session.user.id } },
    update: { declarado },
    create: { partidoId: params.id, userId: session.user.id, declarado },
  });

  await registrarEvento(
    params.id,
    declarado
      ? `${nombreMostrado(usuario)} dice que viene a ver el partido`
      : `${nombreMostrado(usuario)} ya no viene a ver el partido`
  );

  return NextResponse.json({ ok: true });
}

// El admin confirma (o quita) de golpe a todos los socios como asistentes
// de verdad — mismo patrón que /api/partidos/[id]/convocatoria (se manda
// la lista completa, se hace upsert de cada uno), no hace falta que se
// hayan autodeclarado antes (el admin puede confirmar a cualquiera aunque
// no haya tocado nada en la app, p.ej. si se lo dijo en persona).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { socios } = (await req.json()) as { socios: { userId: string; confirmado: boolean }[] };
  if (!Array.isArray(socios)) {
    return NextResponse.json({ error: "Faltan los socios." }, { status: 400 });
  }

  await prisma.$transaction(
    socios.map((s) =>
      prisma.asistenciaSocio.upsert({
        where: { partidoId_userId: { partidoId: params.id, userId: s.userId } },
        update: { confirmado: s.confirmado },
        create: { partidoId: params.id, userId: s.userId, declarado: false, confirmado: s.confirmado },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
