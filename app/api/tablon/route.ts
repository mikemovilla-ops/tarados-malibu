import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estaAlDiaDePago } from "@/lib/pagos";
import { puedeEscribirTablon } from "@/lib/tablon";

// Cualquiera logueado —jugador o socio— puede abrir un tema nuevo (sin
// padreId) o responder a uno existente (con padreId), salvo un socio con
// alguna cuota de socio pendiente: ese solo puede leer el tablón. Esta
// comprobación siempre mira el rol/pago real en la BD (nunca la vista
// previa del admin, ver lib/viewer.ts): la vista previa solo cambia qué se
// pinta, no permisos reales de servidor.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const autor = await prisma.user.findUnique({ where: { id: session.user.id }, select: { rol: true } });
  const alDiaDePago = autor?.rol === "SOCIO" ? await estaAlDiaDePago(session.user.id, "SOCIO") : true;
  if (!puedeEscribirTablon({ logueado: true, rol: autor?.rol ?? null, alDiaDePago })) {
    return NextResponse.json(
      { error: "Tienes alguna cuota de socio pendiente. Ponte al día para poder escribir en el tablón." },
      { status: 403 }
    );
  }

  const { texto, padreId } = (await req.json()) as { texto: string; padreId?: string };
  if (!texto || !texto.trim()) {
    return NextResponse.json({ error: "Falta el texto." }, { status: 400 });
  }

  if (padreId) {
    const padre = await prisma.mensajeTablon.findUnique({ where: { id: padreId } });
    if (!padre) {
      return NextResponse.json({ error: "El mensaje al que respondes ya no existe." }, { status: 404 });
    }
  }

  const mensaje = await prisma.mensajeTablon.create({
    data: { texto: texto.trim(), autorId: session.user.id, padreId: padreId ?? null },
  });

  return NextResponse.json({ ok: true, mensaje });
}
