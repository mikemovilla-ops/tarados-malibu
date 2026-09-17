import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { telefono, emailNotificaciones, dni, fechaNacimiento } = (await req.json()) as {
    telefono: string;
    emailNotificaciones: string;
    dni: string;
    fechaNacimiento: string;
  };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      telefono: telefono.trim() || null,
      emailNotificaciones: emailNotificaciones.trim() || null,
      dni: dni.trim() || null,
      fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
    },
  });

  return NextResponse.json({ ok: true });
}
