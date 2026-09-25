import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { COOKIE_VISTA_PREVIA, PERFILES_VISTA_PREVIA } from "@/lib/viewer";

// Solo para que el propio admin pruebe la app en local como si fuera otro
// perfil (ver lib/viewer.ts) — nunca tiene efecto en producción, y nunca
// cambia ningún permiso real de servidor.
export async function POST(req: Request) {
  if (process.env.VERCEL_ENV === "production") {
    return NextResponse.json({ error: "No disponible en producción." }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { perfil } = (await req.json()) as { perfil: string };
  if (!PERFILES_VISTA_PREVIA.includes(perfil as any)) {
    return NextResponse.json({ error: "Perfil no válido." }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  if (perfil === "") {
    res.cookies.delete(COOKIE_VISTA_PREVIA);
  } else {
    res.cookies.set(COOKIE_VISTA_PREVIA, perfil, { sameSite: "lax", path: "/" });
  }
  return res;
}
