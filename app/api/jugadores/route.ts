import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { POSICIONES } from "@/lib/posiciones";
import { ESTADOS } from "@/lib/estados";

// Alta manual de un jugador sin que tenga que loguearse con Google: se crea
// un User con email null, solo para convocar/llevar sus estadísticas. Si
// esa persona entra alguna vez con su propia cuenta de Google, se le crea
// un User aparte (el login no sabe nada de esta fila) — el admin tendría
// que unificarlos a mano; caso raro que no merece la pena automatizar aquí.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await req.json();
  const { nombre, dorsal, posicion, estado } = body as {
    nombre: string;
    dorsal?: number | null;
    posicion?: string | null;
    estado?: string;
  };

  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "Falta el nombre." }, { status: 400 });
  }
  if (posicion && !POSICIONES.includes(posicion as any)) {
    return NextResponse.json({ error: "Posición no válida." }, { status: 400 });
  }
  if (estado && !ESTADOS.includes(estado as any)) {
    return NextResponse.json({ error: "Estado no válido." }, { status: 400 });
  }

  const jugador = await prisma.user.create({
    data: {
      name: nombre.trim(),
      dorsal: dorsal ?? null,
      posicion: (posicion as any) ?? null,
      estado: (estado as any) ?? "AYUDA",
    },
  });

  return NextResponse.json({ ok: true, jugador });
}
