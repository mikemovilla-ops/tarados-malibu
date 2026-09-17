import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POSICIONES } from "@/lib/posiciones";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { dorsal, posicion, activo } = body as {
    dorsal?: number | null;
    posicion?: string | null;
    activo?: boolean;
  };

  if (posicion !== undefined && posicion !== null && !POSICIONES.includes(posicion as any)) {
    return NextResponse.json({ error: "Posición no válida." }, { status: 400 });
  }

  const jugador = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(dorsal !== undefined ? { dorsal } : {}),
      ...(posicion !== undefined ? { posicion: posicion as any } : {}),
      ...(activo !== undefined ? { activo } : {}),
    },
  });

  return NextResponse.json({ ok: true, jugador });
}
