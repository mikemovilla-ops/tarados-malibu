import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setImportePago, TIPOS_PAGO } from "@/lib/pagos";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { tipo, importe } = (await req.json()) as { tipo: string; importe: number };
  if (!TIPOS_PAGO.includes(tipo as any)) {
    return NextResponse.json({ error: "Tipo de pago no válido." }, { status: 400 });
  }
  if (typeof importe !== "number" || importe < 0) {
    return NextResponse.json({ error: "Importe no válido." }, { status: 400 });
  }

  await setImportePago(tipo as any, importe);
  return NextResponse.json({ ok: true });
}
