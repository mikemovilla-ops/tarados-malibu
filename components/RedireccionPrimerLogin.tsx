"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

// Manda a quien acaba de entrar por primera vez directo a /ajustes (para
// que ponga su apodo, posición, teléfono...) en vez de dejarlo en la home.
// `session.user.esNuevo` lo calcula lib/auth.ts a partir de cuándo se creó
// la cuenta — ver el comentario allí. `necesitaElegirRol` hace lo mismo
// pero no caduca: mientras no haya contestado "¿eres jugador?"
// (ElegirRolInicial), se le sigue mandando a Ajustes cada vez que entra, no
// solo la primera vez.
export default function RedireccionPrimerLogin() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const yaRedirigido = useRef(false);

  useEffect(() => {
    if (yaRedirigido.current) return;
    if (!session?.user?.esNuevo && !session?.user?.necesitaElegirRol) return;
    if (pathname === "/ajustes") return;

    yaRedirigido.current = true;
    router.replace("/ajustes");
  }, [session, pathname, router]);

  return null;
}
