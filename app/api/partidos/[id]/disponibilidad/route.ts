import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALORES = ["VOY", "NO_VOY", "DUDA"] as const;

// A diferencia de /convocatoria (solo admin), este endpoint lo usa
// cualquier jugador autenticado para responder por sí mismo si va, no va o
// duda de un partido. Responder "Voy" convoca directamente (convocado a
// true) para no obligar al admin a repetir el mismo tick a mano; "No voy"
// lo desconvoca. "Duda" no toca `convocado`, para no forzar ni sí ni no
// mientras el admin puede seguir corrigiéndolo a mano en cualquier momento
// desde el editor de convocatoria.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { disponibilidad } = (await req.json()) as { disponibilidad: string };
  if (!VALORES.includes(disponibilidad as any)) {
    return NextResponse.json({ error: "Respuesta no válida." }, { status: 400 });
  }

  const partido = await prisma.partido.findUnique({ where: { id: params.id }, select: { cerrado: true } });
  if (partido?.cerrado) {
    return NextResponse.json({ error: "La jornada ya está cerrada." }, { status: 400 });
  }

  const convocado = disponibilidad === "VOY" ? true : disponibilidad === "NO_VOY" ? false : undefined;

  await prisma.convocatoria.upsert({
    where: { partidoId_userId: { partidoId: params.id, userId: session.user.id } },
    update: { disponibilidad: disponibilidad as any, ...(convocado !== undefined ? { convocado } : {}) },
    create: {
      partidoId: params.id,
      userId: session.user.id,
      disponibilidad: disponibilidad as any,
      convocado: convocado ?? false,
    },
  });

  return NextResponse.json({ ok: true });
}
