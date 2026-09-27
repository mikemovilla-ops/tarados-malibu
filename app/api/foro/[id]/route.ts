import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Solo quien abrió el tema puede editarlo (ni el admin ni nadie más) — una
// respuesta no tiene título, así que no se edita por aquí.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const mensaje = await prisma.mensajeForo.findUnique({ where: { id: params.id } });
  if (!mensaje) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  if (mensaje.padreId !== null) {
    return NextResponse.json({ error: "Una respuesta no se puede editar." }, { status: 400 });
  }
  if (mensaje.autorId !== session.user.id) {
    return NextResponse.json({ error: "Solo quien abrió el tema puede editarlo." }, { status: 403 });
  }

  const { titulo, texto } = (await req.json()) as { titulo: string; texto: string };
  if (!titulo || !titulo.trim() || !texto || !texto.trim()) {
    return NextResponse.json({ error: "Falta el título o el mensaje." }, { status: 400 });
  }

  const actualizado = await prisma.mensajeForo.update({
    where: { id: params.id },
    data: { titulo: titulo.trim(), texto: texto.trim() },
  });

  return NextResponse.json({ ok: true, mensaje: actualizado });
}

// Moderación básica: borrar un tema se lleva también sus respuestas
// (onDelete: Cascade en el propio modelo). El admin puede borrar
// cualquier mensaje; quien abrió un tema también puede borrarlo él mismo,
// pero solo mientras nadie le haya respondido todavía (si no, se llevaría
// por delante el debate de otros). El autor de una respuesta suelta no
// puede borrarla él mismo, solo el admin.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (session.user.isAdmin) {
    await prisma.mensajeForo.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  }

  const mensaje = await prisma.mensajeForo.findUnique({
    where: { id: params.id },
    include: { _count: { select: { respuestas: true } } },
  });
  if (!mensaje) {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }
  if (mensaje.autorId !== session.user.id || mensaje.padreId !== null) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
  if (mensaje._count.respuestas > 0) {
    return NextResponse.json({ error: "Ya tiene respuestas — no se puede borrar." }, { status: 400 });
  }

  await prisma.mensajeForo.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
