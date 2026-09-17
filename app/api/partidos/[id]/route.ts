import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { fecha, rival, esLocal, competicion, lugar, golesFavor, golesContra, notas } = body as {
    fecha?: string;
    rival?: string;
    esLocal?: boolean;
    competicion?: string;
    lugar?: string | null;
    golesFavor?: number | null;
    golesContra?: number | null;
    notas?: string | null;
  };

  const partido = await prisma.partido.update({
    where: { id: params.id },
    data: {
      ...(fecha !== undefined ? { fecha: new Date(fecha) } : {}),
      ...(rival !== undefined ? { rival } : {}),
      ...(esLocal !== undefined ? { esLocal } : {}),
      ...(competicion !== undefined ? { competicion } : {}),
      ...(lugar !== undefined ? { lugar } : {}),
      ...(golesFavor !== undefined ? { golesFavor } : {}),
      ...(golesContra !== undefined ? { golesContra } : {}),
      ...(notas !== undefined ? { notas } : {}),
    },
  });

  return NextResponse.json({ ok: true, partido });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  await prisma.partido.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
