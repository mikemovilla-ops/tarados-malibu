"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nombreMostrado } from "@/lib/jugadores";
import { formatFechaHora } from "@/lib/fechas";
import FormNuevoMensajeTablon from "@/components/FormNuevoMensajeTablon";

type Autor = { name: string | null; apodo: string | null };
type Mensaje = { id: string; texto: string; createdAt: Date; autor: Autor };
type Tema = Mensaje & { respuestas: Mensaje[] };

function BotonBorrar({ id }: { id: string }) {
  const router = useRouter();
  const [borrando, startBorrar] = useTransition();

  function borrar() {
    if (!confirm("¿Seguro que quieres borrar este mensaje? No se puede deshacer.")) return;
    startBorrar(async () => {
      const res = await fetch(`/api/tablon/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  return (
    <button onClick={borrar} disabled={borrando} className="text-coral/70 hover:text-coral text-xs disabled:opacity-50">
      Borrar
    </button>
  );
}

export default function MensajeTablon({
  tema,
  esAdmin,
  puedeEscribir,
}: {
  tema: Tema;
  esAdmin: boolean;
  puedeEscribir: boolean;
}) {
  const [respondiendo, setRespondiendo] = useState(false);

  return (
    <div className="card p-4 space-y-3">
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-chalk font-display">{nombreMostrado(tema.autor)}</span>
          <span className="text-chalk/40 text-xs">{formatFechaHora(tema.createdAt)}</span>
        </div>
        <p className="text-chalk/90 text-sm whitespace-pre-wrap">{tema.texto}</p>
        <div className="flex items-center gap-3 pt-1">
          {puedeEscribir && (
            <button onClick={() => setRespondiendo((v) => !v)} className="text-amarillobrillante text-xs hover:underline">
              {respondiendo ? "Cancelar" : "Responder"}
            </button>
          )}
          {esAdmin && <BotonBorrar id={tema.id} />}
        </div>
        {respondiendo && (
          <div className="pt-1">
            <FormNuevoMensajeTablon
              padreId={tema.id}
              placeholder="Escribe una respuesta..."
              autoFocus
              onEnviado={() => setRespondiendo(false)}
            />
          </div>
        )}
      </div>

      {tema.respuestas.length > 0 && (
        <div className="pl-4 border-l border-chalk/10 space-y-3">
          {tema.respuestas.map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-chalk text-sm font-display">{nombreMostrado(r.autor)}</span>
                <span className="text-chalk/40 text-xs">{formatFechaHora(r.createdAt)}</span>
              </div>
              <p className="text-chalk/80 text-sm whitespace-pre-wrap">{r.texto}</p>
              {esAdmin && <BotonBorrar id={r.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
