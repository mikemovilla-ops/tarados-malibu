import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// No hace falta "generar" el pago de antemano: la primera vez que el admin
// marca a un jugador en una sección, se crea aquí (upsert) con el importe
// que tuviera configurado esa sección en ese momento.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { userId, seccionId, pagado } = (await req.json()) as { userId: string; seccionId: string; pagado: boolean };
  if (!userId || !seccionId) {
    return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  }

  const seccion = await prisma.seccionPago.findUnique({ where: { id: seccionId } });
  if (!seccion) {
    return NextResponse.json({ error: "Sección no encontrada." }, { status: 404 });
  }

  await prisma.pago.upsert({
    where: { userId_seccionId: { userId, seccionId } },
    update: { pagado, fechaPago: pagado ? new Date() : null },
    create: { userId, seccionId, importe: seccion.importe, pagado, fechaPago: pagado ? new Date() : null },
  });

  return NextResponse.json({ ok: true });
}
