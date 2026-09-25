import { cookies } from "next/headers";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type Viewer = {
  session: Session | null;
  userId: string | null;
  esAdmin: boolean;
  rol: "JUGADOR" | "SOCIO" | null;
  estado: "ACTIVO" | "AYUDA" | null;
  // Solo viene forzado (true/false) durante una vista previa de socio; en
  // cualquier otro caso es null y hay que calcularlo de verdad (ver
  // lib/pagos.ts: estaAlDiaDePago) si hace falta para lo que se esté
  // mostrando (p.ej. quién puede escribir en /tablon).
  alDiaDePago: boolean | null;
};

export type PerfilReal = { esAdmin: boolean; rol: Viewer["rol"]; estado: Viewer["estado"] };
export type ResultadoVistaPrevia = { esAdmin: boolean; rol: Viewer["rol"]; estado: Viewer["estado"]; alDiaDePago: boolean | null };

export const COOKIE_VISTA_PREVIA = "vista_previa";
export const PERFILES_VISTA_PREVIA = ["", "ACTIVO", "AYUDA", "SOCIO_PAGADO", "SOCIO_PENDIENTE"] as const;

// Decide qué ve el admin durante una vista previa, a partir de su perfil
// real y del valor de la cookie — separada de getViewer() (que la envuelve
// con la sesión y las consultas a la BD) para poder testearla sin mockear
// next/headers ni Prisma. Nunca tiene efecto si `enProduccion`, o si
// `real.esAdmin` es false (la vista previa solo existe para el admin de
// verdad, nunca cambia el perfil de otra persona).
export function aplicarVistaPrevia(real: PerfilReal, cookieValor: string | undefined, enProduccion: boolean): ResultadoVistaPrevia {
  const sinCambios: ResultadoVistaPrevia = { ...real, alDiaDePago: null };
  if (enProduccion || !real.esAdmin) return sinCambios;

  switch (cookieValor) {
    case "ACTIVO":
    case "AYUDA":
      return { esAdmin: false, rol: "JUGADOR", estado: cookieValor, alDiaDePago: null };
    case "SOCIO_PAGADO":
      return { esAdmin: false, rol: "SOCIO", estado: null, alDiaDePago: true };
    case "SOCIO_PENDIENTE":
      return { esAdmin: false, rol: "SOCIO", estado: null, alDiaDePago: false };
    default:
      return sinCambios;
  }
}

// Centraliza lo que antes resolvía cada página por su cuenta (esAdmin, y en
// varias un segundo prisma.user.findUnique para rol/estado). Los endpoints
// que escriben (PATCH/POST/DELETE admin-only) siguen comprobando
// session.user.isAdmin tal cual: la vista previa solo cambia qué se pinta,
// no los permisos reales de servidor.
export async function getViewer(): Promise<Viewer> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const esAdminReal = !!session?.user?.isAdmin;
  let rol: Viewer["rol"] = null;
  let estado: Viewer["estado"] = null;

  if (userId) {
    const usuario = await prisma.user.findUnique({ where: { id: userId }, select: { rol: true, estado: true } });
    rol = usuario?.rol ?? null;
    estado = usuario?.estado ?? null;
  }

  const cookieValor = cookies().get(COOKIE_VISTA_PREVIA)?.value;
  const resultado = aplicarVistaPrevia(
    { esAdmin: esAdminReal, rol, estado },
    cookieValor,
    process.env.VERCEL_ENV === "production"
  );

  return { session, userId, ...resultado };
}
