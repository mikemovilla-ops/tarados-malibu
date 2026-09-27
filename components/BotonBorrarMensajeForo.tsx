"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

// `esTema`: al borrar el tema entero (no una respuesta suelta) hay que
// salir de su página si estabas en ella, además de refrescar — por eso
// hace las dos cosas: sirve tanto desde la propia página del tema como
// desde la fila de /foro (donde un `push` a la misma ruta no basta para
// que la lista se actualice).
export default function BotonBorrarMensajeForo({ id, esTema = false }: { id: string; esTema?: boolean }) {
  const router = useRouter();
  const [borrando, startBorrar] = useTransition();

  function borrar(e: React.MouseEvent) {
    // Cuando este botón vive dentro de la tarjeta-enlace de la lista de
    // temas (ForoTemaResumen), sin esto el click también dispararía la
    // navegación al tema.
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Seguro que quieres borrar este mensaje? No se puede deshacer.")) return;
    startBorrar(async () => {
      const res = await fetch(`/api/foro/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (esTema) router.push("/foro");
        router.refresh();
      }
    });
  }

  return (
    <button onClick={borrar} disabled={borrando} className="text-coral/70 hover:text-coral text-xs disabled:opacity-50">
      Borrar
    </button>
  );
}
