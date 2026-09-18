"use client";

import { useState, useTransition } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

function IconoHome({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

function IconoPlantilla({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M14.8 14.3c2.3.3 4.2 2.5 4.2 5.2" />
    </svg>
  );
}

function IconoCalendario({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
      <path d="M4 9.5h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </svg>
  );
}

function IconoEstadisticas({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 20V11M12 20V4M19 20v-7" />
    </svg>
  );
}

function IconoPerfil({ activo }: { activo: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth={activo ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </svg>
  );
}

function MenuPerfil({
  autenticado,
  onNavegar,
  onSalir,
}: {
  autenticado: boolean;
  onNavegar: (e: React.MouseEvent, href: string) => void;
  onSalir: () => void;
}) {
  const enlaceClass = "text-chalk/70 hover:text-chalk transition";
  return (
    <div className="border-b border-chalk/10 px-4 py-3 flex flex-col gap-3 text-sm bg-pitchdark/95">
      {autenticado && (
        <Link href="/pagos" className={enlaceClass} onClick={(e) => onNavegar(e, "/pagos")}>
          Pagos
        </Link>
      )}
      {autenticado && (
        <Link href="/ajustes" className={enlaceClass} onClick={(e) => onNavegar(e, "/ajustes")}>
          Ajustes
        </Link>
      )}
      {autenticado && (
        <button onClick={onSalir} className="text-left text-chalk/70 hover:text-coral transition">
          Salir
        </button>
      )}
    </div>
  );
}

// Barra de navegación fija abajo, solo en móvil (md:hidden) — sustituye a
// los enlaces de arriba. Pestañas fijas: Inicio, Plantilla, Calendario y
// Estadísticas, más un último hueco con tu avatar/perfil que abre Pagos,
// Ajustes y Salir (secciones que solo tienen sentido si has entrado).
export default function BottomNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [navegando, startTransition] = useTransition();

  function navegar(e: React.MouseEvent, href: string) {
    e.preventDefault();
    setMenuAbierto(false);
    if (navegando) return;
    startTransition(() => {
      if (pathname === href) {
        router.refresh();
      } else {
        router.push(href);
      }
    });
  }

  const pestanas = [
    { href: "/", label: "Inicio", Icono: IconoHome },
    { href: "/plantilla", label: "Plantilla", Icono: IconoPlantilla },
    { href: "/calendario", label: "Calendario", Icono: IconoCalendario },
    { href: "/estadisticas", label: "Stats", Icono: IconoEstadisticas },
  ];

  return (
    <>
      {/* La Navbar de escritorio ya tiene su propia barra de progreso, pero
          usa su propio estado `navegando` — en móvil se navega desde aquí
          (BottomNav), así que hace falta la suya propia. Fija arriba del
          todo para que se vea aunque la página esté desplazada hacia abajo,
          y evitar así que, al no ver ningún indicio de que el click ha
          funcionado, alguien acabe dándole varias veces seguidas al mismo
          enlace. */}
      {navegando && (
        <div className="md:hidden fixed inset-x-0 top-0 z-50 h-0.5 bg-amarillobrillante animate-pulse" />
      )}
      {menuAbierto && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMenuAbierto(false)} />
      )}
      {/* "Flotante": no toca los bordes de la pantalla, con sombra para que
          se note que va por delante del contenido. */}
      <nav className="md:hidden fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-chalk/10 bg-pitchdark/95 backdrop-blur-sm shadow-lg shadow-black/40 overflow-hidden">
        {menuAbierto && (
          <MenuPerfil
            autenticado={status === "authenticated"}
            onNavegar={navegar}
            onSalir={() => {
              setMenuAbierto(false);
              signOut();
            }}
          />
        )}
        <div className="flex items-stretch justify-around">
          {pestanas.map(({ href, label, Icono }) => {
            const activo = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => navegar(e, href)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition ${
                  activo ? "text-amarillobrillante" : "text-chalk/50"
                }`}
              >
                <Icono activo={activo} />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => (status === "authenticated" ? setMenuAbierto((v) => !v) : signIn("google"))}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition ${
              menuAbierto ? "text-amarillobrillante" : "text-chalk/50"
            }`}
          >
            {status === "authenticated" && session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "Tú"}
                width={22}
                height={22}
                className={`rounded-full border ${menuAbierto ? "border-amarillobrillante" : "border-chalk/30"}`}
              />
            ) : (
              <IconoPerfil activo={menuAbierto} />
            )}
            {status === "authenticated" ? "Tú" : "Entrar"}
          </button>
        </div>
      </nav>
    </>
  );
}
