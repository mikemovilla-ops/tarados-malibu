"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

// Manda a quien acaba de entrar por primera vez directo a /ajustes, una
// sola vez, para que vea el aviso de "pendiente de clasificar"
// (PendienteClasificar) y sepa qué puede hacer mientras tanto.
// `session.user.esNuevo` lo calcula lib/auth.ts a partir de cuándo se creó
// la cuenta — ver el comentario allí. A diferencia de antes, ya no
// redirige en cada visita mientras `necesitaElegirRol` siga activo: ahora
// no hay nada que contestar ahí (el admin es quien clasifica desde
// Plantilla), así que forzar el salto cada vez solo le impediría navegar
// por la home, la plantilla o el calendario, que sí puede ver.
export default function RedireccionPrimerLogin() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const yaRedirigido = useRef(false);

  useEffect(() => {
    if (yaRedirigido.current) return;
    if (!session?.user?.esNuevo) return;
    if (pathname === "/ajustes") return;

    yaRedirigido.current = true;
    router.replace("/ajustes");
  }, [session, pathname, router]);

  return null;
}
