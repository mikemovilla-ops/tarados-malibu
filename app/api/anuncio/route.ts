import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { texto, activo } = (await req.json()) as { texto: string; activo: boolean };

  const anuncio = await prisma.anuncio.upsert({
    where: { id: "actual" },
    create: { id: "actual", texto: texto.trim(), activo },
    update: { texto: texto.trim(), activo },
  });

  return NextResponse.json({ ok: true, anuncio });
}
