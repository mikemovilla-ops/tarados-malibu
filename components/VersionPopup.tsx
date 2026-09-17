"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_VERSION, HISTORIAL_VERSIONES, type EntradaVersion } from "@/lib/version";

const STORAGE_KEY = "malibu_version_vista";

export default function VersionPopup() {
  const [entradas, setEntradas] = useState<EntradaVersion[] | null>(null);

  useEffect(() => {
    const vista = window.localStorage.getItem(STORAGE_KEY);
    if (vista === APP_VERSION) return;

    if (!vista) {
      // Primera visita de este navegador: solo mostramos la versión actual.
      setEntradas([HISTORIAL_VERSIONES[0]]);
      return;
    }

    const idxVista = HISTORIAL_VERSIONES.findIndex((h) => h.version === vista);
    setEntradas(idxVista === -1 ? [HISTORIAL_VERSIONES[0]] : HISTORIAL_VERSIONES.slice(0, idxVista));
  }, []);

  function cerrar() {
    window.localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setEntradas(null);
  }

  if (!entradas || entradas.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <h2 className="font-display text-lg text-amarillobrillante">Novedades — {APP_VERSION}</h2>
        <div className="max-h-80 space-y-4 overflow-y-auto text-sm text-chalk/80">
          {entradas.map((entrada) => (
            <div key={entrada.version}>
              {entrada.hito && (
                <div className="flex items-center gap-2 pb-2">
                  <div className="h-px flex-1 bg-amarillobrillante/30" />
                  <span className="font-display text-[10px] uppercase tracking-widest text-amarillobrillante">
                    Primera versión
                  </span>
                  <div className="h-px flex-1 bg-amarillobrillante/30" />
                </div>
              )}
              <p className="font-medium text-chalk">
                {entrada.version} <span className="text-chalk/40">({entrada.fecha})</span>
              </p>
              <ul className="mt-1 list-inside list-disc space-y-1">
                {entrada.cambios.map((cambio, i) => (
                  <li key={i}>
                    {typeof cambio === "string" ? (
                      cambio
                    ) : (
                      <>
                        {cambio.texto}{" "}
                        <span className="ml-1 inline-block rounded-full bg-amarillobrillante/15 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-wide text-amarillobrillante">
                          {cambio.origen}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button
          onClick={cerrar}
          className="w-full rounded-lg bg-amarillo py-2.5 font-display text-pitchdark transition hover:bg-amarillobrillante"
        >
          Entendido
        </button>
        <Link
          href="/novedades"
          onClick={cerrar}
          className="block text-center text-xs text-chalk/40 underline hover:text-chalk/70"
        >
          Ver todo el historial de versiones
        </Link>
      </div>
    </div>
  );
}
