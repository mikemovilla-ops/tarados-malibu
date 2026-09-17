import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generarCuotasDelMes } from "@/lib/pagos";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { mes } = (await req.json()) as { mes: string };
  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ error: "Mes no válido." }, { status: 400 });
  }

  const creadas = await generarCuotasDelMes(mes);
  return NextResponse.json({ ok: true, creadas });
}
