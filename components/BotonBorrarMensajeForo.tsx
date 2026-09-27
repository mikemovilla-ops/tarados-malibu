"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

// `esTema`: al borrar el tema entero (no una respuesta suelta) hay que
// salir de su página, que ya no existe, en vez de refrescarla.
export default function BotonBorrarMensajeForo({ id, esTema = false }: { id: string; esTema?: boolean }) {
  const router = useRouter();
  const [borrando, startBorrar] = useTransition();

  function borrar() {
    if (!confirm("¿Seguro que quieres borrar este mensaje? No se puede deshacer.")) return;
    startBorrar(async () => {
      const res = await fetch(`/api/foro/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (esTema) {
          router.push("/foro");
        } else {
          router.refresh();
        }
      }
    });
  }

  return (
    <button onClick={borrar} disabled={borrando} className="text-coral/70 hover:text-coral text-xs disabled:opacity-50">
      Borrar
    </button>
  );
}
