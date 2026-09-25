import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Moderación básica: borrar un tema se lleva también sus respuestas
// (onDelete: Cascade en el propio modelo).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  await prisma.mensajeTablon.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
