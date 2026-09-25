import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLES } from "@/lib/roles";

// A diferencia de PATCH /api/jugadores/[id] (admin-only), este lo llama el
// propio usuario para contestar "¿vienes a jugar o eres socio?" la primera
// vez que entra (ver ElegirRolInicial en /ajustes).
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rol } = (await req.json()) as { rol: string };
  if (!ROLES.includes(rol as any)) {
    return NextResponse.json({ error: "Rol no válido." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { rol: rol as any, rolElegido: true },
  });

  return NextResponse.json({ ok: true });
}
