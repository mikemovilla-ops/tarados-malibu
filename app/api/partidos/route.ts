import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { fecha, rival, esLocal, competicion, jornada, lugar } = body as {
    fecha: string;
    rival: string;
    esLocal: boolean;
    competicion?: string;
    jornada?: number | null;
    lugar?: string;
  };

  if (!fecha || !rival) {
    return NextResponse.json({ error: "Faltan datos del partido." }, { status: 400 });
  }

  const partido = await prisma.partido.create({
    data: {
      fecha: new Date(fecha),
      rival,
      esLocal: !!esLocal,
      competicion: competicion || "Liga",
      jornada: jornada ?? null,
      lugar: lugar || null,
    },
  });

  return NextResponse.json({ ok: true, partido });
}
