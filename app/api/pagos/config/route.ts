import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setCuotaMensual } from "@/lib/pagos";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { importe } = (await req.json()) as { importe: number };
  if (typeof importe !== "number" || importe < 0) {
    return NextResponse.json({ error: "Importe no válido." }, { status: 400 });
  }

  await setCuotaMensual(importe);
  return NextResponse.json({ ok: true });
}
