import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { pagado } = (await req.json()) as { pagado: boolean };

  const cuota = await prisma.cuota.update({
    where: { id: params.id },
    data: { pagado, fechaPago: pagado ? new Date() : null },
  });

  return NextResponse.json({ ok: true, cuota });
}
