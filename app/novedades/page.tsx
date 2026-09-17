import Link from "next/link";
import { HISTORIAL_VERSIONES } from "@/lib/version";

export default function Novedades() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-2xl text-center">Novedades</h1>
      <p className="text-center text-chalk/50 text-sm">
        Todo lo que ha ido cambiando en la app, versión a versión.
      </p>

      {HISTORIAL_VERSIONES.map((entrada) => (
        <div key={entrada.version}>
          {entrada.hito && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-amarillobrillante/30" />
              <span className="font-display text-xs uppercase tracking-widest text-amarillobrillante">
                Primera versión
              </span>
              <div className="h-px flex-1 bg-amarillobrillante/30" />
            </div>
          )}
          <div className="card p-5">
            <h2 className="font-display text-lg text-amarillobrillante">
              {entrada.version} <span className="text-chalk/40 text-sm">({entrada.fecha})</span>
            </h2>
            <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm text-chalk/80">
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
        </div>
      ))}

      <p className="text-center">
        <Link href="/" className="text-chalk/50 text-sm underline hover:text-chalk">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
