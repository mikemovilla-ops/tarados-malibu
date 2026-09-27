"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function EditarTemaForo({
  id,
  tituloInicial,
  textoInicial,
}: {
  id: string;
  tituloInicial: string;
  textoInicial: string;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState(tituloInicial);
  const [texto, setTexto] = useState(textoInicial);
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/foro/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, texto }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      setAbierto(false);
      router.refresh();
    });
  }

  return (
    <>
      <button onClick={() => setAbierto(true)} className="text-amarillobrillante text-xs hover:underline">
        Editar
      </button>
      {abierto && (
        <Modal titulo="Editar tema" onClose={() => setAbierto(false)}>
          <form onSubmit={guardar} className="space-y-3 text-sm">
            <label className="space-y-1 block">
              <span className="text-chalk/60 text-xs">Título</span>
              <input
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-chalk/60 text-xs">Mensaje</span>
              <textarea
                required
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={4}
                className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
              />
            </label>
            {error && <p className="text-coral">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
                Guardar
              </button>
              <button type="button" onClick={() => setAbierto(false)} className="text-chalk/60 px-3 py-1.5">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
