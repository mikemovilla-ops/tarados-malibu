import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POSICIONES } from "@/lib/posiciones";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { apodo, posicion } = (await req.json()) as { apodo: string; posicion: string };
  if (posicion && !POSICIONES.includes(posicion as any)) {
    return NextResponse.json({ error: "Posición no válida." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { apodo: apodo.trim() || null, posicion: (posicion as any) || null },
  });

  return NextResponse.json({ ok: true });
}
