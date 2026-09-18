import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { crearSeccion } from "@/lib/pagos";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { nombre, importe } = (await req.json()) as { nombre: string; importe: number };
  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "Falta el nombre de la sección." }, { status: 400 });
  }
  if (typeof importe !== "number" || importe < 0) {
    return NextResponse.json({ error: "Importe no válido." }, { status: 400 });
  }

  const seccion = await crearSeccion(nombre.trim(), importe);
  return NextResponse.json({ ok: true, seccion });
}
