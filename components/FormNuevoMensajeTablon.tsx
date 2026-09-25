"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function FormNuevoMensajeTablon({
  padreId,
  placeholder = "Escribe algo...",
  autoFocus = false,
  onEnviado,
}: {
  padreId?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onEnviado?: () => void;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [enviando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/tablon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, padreId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo publicar.");
        return;
      }
      setTexto("");
      onEnviado?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={enviar} className="space-y-2 text-sm">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={placeholder}
        rows={2}
        autoFocus={autoFocus}
        className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
      />
      {error && <p className="text-coral">{error}</p>}
      <button type="submit" disabled={enviando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
        Publicar
      </button>
    </form>
  );
}
