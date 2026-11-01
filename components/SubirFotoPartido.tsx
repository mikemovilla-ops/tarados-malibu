"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";

// La foto se sube directo del navegador a Vercel Blob (ver
// app/api/partidos/[id]/foto/route.ts, que solo genera el token) y luego se
// guarda la URL resultante con un PATCH normal — así una foto de móvil de
// varios MB no pasa por el límite de tamaño de una función serverless.
export default function SubirFotoPartido({
  partidoId,
  fotoUrlInicial,
}: {
  partidoId: string;
  fotoUrlInicial: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotoUrl, setFotoUrl] = useState(fotoUrlInicial);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function subir(file: File) {
    setError(null);
    setSubiendo(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `/api/partidos/${partidoId}/foto`,
      });
      const res = await fetch(`/api/partidos/${partidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotoUrl: blob.url }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "No se pudo guardar la foto.");
      }
      setFotoUrl(blob.url);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2 text-sm">
      {fotoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fotoUrl} alt="Foto del partido" className="rounded-lg max-h-48 w-full object-cover" />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) subir(file);
        }}
        disabled={subiendo}
        className="text-xs text-chalk/60"
      />
      {subiendo && <p className="text-chalk/50 text-xs">Subiendo...</p>}
      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  );
}
