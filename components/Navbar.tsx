"use client";

import { useTransition } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { APP_VERSION } from "@/lib/version";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [navegando, startTransition] = useTransition();

  // Los enlaces de navegación pueden tardar un momento en traer datos del
  // servidor y, mientras tanto, no hay ningún indicio visual de que el
  // click ha funcionado (se queda "congelado"), lo que invita a hacer doble
  // click. Interceptamos el click para: 1) mostrar una barra de progreso
  // mientras navega y 2) ignorar clicks repetidos hasta que termine la
  // navegación en curso.
  function navegar(e: React.MouseEvent, href: string) {
    e.preventDefault();
    if (navegando) return;
    startTransition(() => {
      if (pathname === href) {
        router.refresh();
      } else {
        router.push(href);
      }
    });
  }

  const enlaceClass = "text-chalk/70 hover:text-chalk transition";

  return (
    <header className="relative border-b border-chalk/10 bg-pitchdark/60">
      {navegando && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-amarillobrillante animate-pulse" />
      )}
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-baseline gap-2 whitespace-nowrap">
          <Link
            href="/"
            onClick={(e) => navegar(e, "/")}
            className="flex items-center gap-2 font-display text-lg tracking-wide text-chalk"
          >
            <Image src="/escudo.png" alt="Escudo Tarados Malibú" width={32} height={32} className="shrink-0" />
            Tarados <span className="text-amarillobrillante">Malibú</span>
          </Link>
          <Link
            href="/novedades"
            className="text-[10px] font-body tracking-normal text-chalk/40 hover:text-chalk/70 hover:underline"
          >
            {APP_VERSION}
          </Link>
        </div>

        {/* Escritorio: enlaces en fila. Se oculta en móvil (la BottomNav de
            abajo hace lo contrario) para no partir el título en varias
            líneas por falta de sitio. */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/plantilla" onClick={(e) => navegar(e, "/plantilla")} className={enlaceClass}>
            Plantilla
          </Link>
          <Link href="/calendario" onClick={(e) => navegar(e, "/calendario")} className={enlaceClass}>
            Calendario
          </Link>
          <Link href="/estadisticas" onClick={(e) => navegar(e, "/estadisticas")} className={enlaceClass}>
            Estadísticas
          </Link>
          {status === "authenticated" && (
            <Link href="/pagos" onClick={(e) => navegar(e, "/pagos")} className={enlaceClass}>
              Pagos
            </Link>
          )}
          {status === "authenticated" && (
            <Link href="/ajustes" onClick={(e) => navegar(e, "/ajustes")} className={enlaceClass}>
              Ajustes
            </Link>
          )}

          {status === "authenticated" ? (
            <div className="flex items-center gap-2 pl-2 border-l border-chalk/10">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Jugador"}
                  width={28}
                  height={28}
                  className="rounded-full border border-chalk/20"
                />
              )}
              <button onClick={() => signOut()} className="text-chalk/70 hover:text-coral transition">
                Salir
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-amarillo text-pitchdark font-medium px-3 py-1.5 rounded-md hover:bg-amarillobrillante transition"
            >
              Entrar con Google
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
