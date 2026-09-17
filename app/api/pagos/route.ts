import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getImportePago, TIPOS_PAGO } from "@/lib/pagos";

// No hace falta "generar" el pago de antemano: la primera vez que el admin
// marca a un jugador en una sección, se crea aquí (upsert) con el importe
// que tuviera configurado esa sección en ese momento.
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { userId, tipo, pagado } = (await req.json()) as { userId: string; tipo: string; pagado: boolean };
  if (!userId || !TIPOS_PAGO.includes(tipo as any)) {
    return NextResponse.json({ error: "Datos no válidos." }, { status: 400 });
  }

  const importe = await getImportePago(tipo as any);

  await prisma.pago.upsert({
    where: { userId_tipo: { userId, tipo: tipo as any } },
    update: { pagado, fechaPago: pagado ? new Date() : null },
    create: { userId, tipo: tipo as any, importe, pagado, fechaPago: pagado ? new Date() : null },
  });

  return NextResponse.json({ ok: true });
}
