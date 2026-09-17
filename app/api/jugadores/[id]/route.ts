import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POSICIONES } from "@/lib/posiciones";
import { ESTADOS } from "@/lib/estados";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { dorsal, posicion, estado, apodo } = body as {
    dorsal?: number | null;
    posicion?: string | null;
    estado?: string;
    apodo?: string | null;
  };

  if (posicion !== undefined && posicion !== null && !POSICIONES.includes(posicion as any)) {
    return NextResponse.json({ error: "Posición no válida." }, { status: 400 });
  }
  if (estado !== undefined && !ESTADOS.includes(estado as any)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const jugador = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(dorsal !== undefined ? { dorsal } : {}),
      ...(posicion !== undefined ? { posicion: posicion as any } : {}),
      ...(estado !== undefined ? { estado: estado as any } : {}),
      ...(apodo !== undefined ? { apodo } : {}),
    },
  });

  return NextResponse.json({ ok: true, jugador });
}
