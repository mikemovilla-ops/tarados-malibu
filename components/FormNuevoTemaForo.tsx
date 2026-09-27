"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function FormNuevoTemaForo() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/foro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, texto }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo publicar.");
        return;
      }
      // El debate del tema se genera en su propia página.
      router.push(`/foro/${data.mensaje.id}`);
    });
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="bg-amarillo text-pitchdark font-medium px-3 py-1.5 rounded-md hover:bg-amarillobrillante transition text-sm"
      >
        + Nuevo tema
      </button>
      {abierto && (
        <Modal titulo="Nuevo tema" onClose={() => setAbierto(false)}>
          <form onSubmit={crear} className="space-y-3 text-sm">
            <label className="space-y-1 block">
              <span className="text-chalk/60 text-xs">Título</span>
              <input
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="¿De qué va el tema?"
                className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-chalk/60 text-xs">Mensaje</span>
              <textarea
                required
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Cuenta el detalle..."
                rows={4}
                className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
              />
            </label>
            {error && <p className="text-coral">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
                Publicar tema
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
