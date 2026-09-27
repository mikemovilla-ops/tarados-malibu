import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// A diferencia de PATCH /api/jugadores/[id] (admin-only, acepta cualquier
// rol), este lo llama el propio usuario para contestar "¿eres jugador?" la
// primera vez que entra (ver ElegirRolInicial en /ajustes). Solo admite
// JUGADOR o NO_JUGADOR: nadie puede autoasignarse SOCIO, que ahora implica
// tener la cuota pagada — a eso solo se llega automáticamente cuando el
// admin marca ese pago (ver app/api/pagos/route.ts).
const ROLES_AUTOSERVICIO = ["JUGADOR", "NO_JUGADOR"];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { rol } = (await req.json()) as { rol: string };
  if (!ROLES_AUTOSERVICIO.includes(rol)) {
    return NextResponse.json({ error: "Rol no válido." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { rol: rol as any, rolElegido: true },
  });

  return NextResponse.json({ ok: true });
}
