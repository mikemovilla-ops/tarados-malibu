import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Autoservicio total, sin confirmación del admin — es solo un recuento
// aproximado para la pizzería, no una lista con consecuencias. Cualquiera
// con sesión puede marcarlo, independiente de si juega, va a ver el
// partido o ninguna de las dos cosas.
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { voy, acompanantes } = (await req.json()) as { voy: boolean; acompanantes?: number };
  const numAcompanantes = Math.max(0, Math.trunc(acompanantes ?? 0));

  await prisma.asistenciaPizza.upsert({
    where: { partidoId_userId: { partidoId: params.id, userId: session.user.id } },
    update: { voy, acompanantes: numAcompanantes },
    create: { partidoId: params.id, userId: session.user.id, voy, acompanantes: numAcompanantes },
  });

  return NextResponse.json({ ok: true });
}
