import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { crearSeccion } from "@/lib/pagos";
import { ROLES } from "@/lib/roles";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { nombre, importe, destinatario } = (await req.json()) as {
    nombre: string;
    importe: number;
    destinatario: string;
  };
  if (!nombre || !nombre.trim()) {
    return NextResponse.json({ error: "Falta el nombre de la sección." }, { status: 400 });
  }
  if (typeof importe !== "number" || importe < 0) {
    return NextResponse.json({ error: "Importe no válido." }, { status: 400 });
  }
  if (!ROLES.includes(destinatario as any)) {
    return NextResponse.json({ error: "Destinatario no válido." }, { status: 400 });
  }

  const seccion = await crearSeccion(nombre.trim(), importe, destinatario as any);
  return NextResponse.json({ ok: true, seccion });
}
