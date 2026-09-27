import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
import { estaAlDiaDePago } from "@/lib/pagos";
import { puedeEscribirForo } from "@/lib/foro";
import ForoTemaResumen from "@/components/ForoTemaResumen";
import FormNuevoTemaForo from "@/components/FormNuevoTemaForo";
import ForoAcceso from "@/components/ForoAcceso";

export const dynamic = "force-dynamic";

export default async function ForoPage() {
  const viewer = await getViewer();

  if (!viewer.session) {
    return <ForoAcceso logueado={false} />;
  }

  // No dejamos entrar a nadie que todavía no haya dicho si es jugador: por
  // defecto trae rol JUGADOR, y le dejaría escribir como tal antes de
  // haberlo confirmado. RedireccionPrimerLogin ya intenta mandarlo a
  // Ajustes en el cliente, pero esto lo cierra también en el servidor
  // (entrando directo por URL, o si el JS aún no ha corrido).
  if (viewer.necesitaElegirRol) {
    redirect("/ajustes");
  }

  // Un "no jugador" sin cuota pagada no puede ni leer el foro — se trata
  // igual que a quien no ha entrado con Google. Un socio que ya promocionó
  // conserva la lectura aunque se atrase en una cuota nueva (ver más abajo,
  // solo se le bloquea escribir).
  if (viewer.rol === "NO_JUGADOR") {
    return <ForoAcceso logueado={true} />;
  }

  // viewer.alDiaDePago solo viene forzado durante una vista previa de
  // socio; en cualquier otro caso hay que calcularlo de verdad.
  const alDiaDePago =
    viewer.alDiaDePago ?? (viewer.rol === "SOCIO" ? await estaAlDiaDePago(viewer.userId!, "SOCIO") : true);
  const puedeEscribir = puedeEscribirForo({ logueado: !!viewer.session, rol: viewer.rol, alDiaDePago });

  // Solo los temas (no sus respuestas) — entrando en cada uno es donde se
  // genera el debate (ver app/foro/[id]/page.tsx). Se ordenan por última
  // actividad (la respuesta más reciente, o su propia fecha si no tiene
  // ninguna) — no por cuándo se abrieron, para que un tema viejo con
  // movimiento nuevo suba arriba. Prisma no puede ordenar por eso
  // directamente, así que se trae la fecha de la última respuesta de cada
  // uno y se ordena en memoria.
  const temasSinOrdenar = await prisma.mensajeForo.findMany({
    where: { padreId: null },
    include: {
      autor: { select: { name: true, apodo: true } },
      _count: { select: { respuestas: true } },
      respuestas: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
    },
  });
  const temas = temasSinOrdenar
    .map((t) => ({ ...t, ultimaActividad: t.respuestas[0]?.createdAt ?? t.createdAt }))
    .sort((a, b) => b.ultimaActividad.getTime() - a.ultimaActividad.getTime());

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Foro</h1>
          <p className="text-chalk/60 text-sm">Preguntas, propuestas o lo que sea — para todo el equipo.</p>
        </div>
        {puedeEscribir && <FormNuevoTemaForo />}
      </div>

      {!puedeEscribir && (
        <div className="card p-4 border-coral/40">
          <p className="text-coral text-sm">
            Para participar en el foro hace falta estar al día con la cuota de socio — puedes conocerla en{" "}
            <Link href="/pagos" className="underline">
              Pagos
            </Link>
            . Consulta con alguien del equipo para más información.
          </p>
        </div>
      )}

      {temas.length === 0 ? (
        <p className="text-chalk/50 text-sm">Todavía no hay ningún tema. Sé el primero.</p>
      ) : (
        <div className="space-y-3">
          {temas.map((tema) => (
            <ForoTemaResumen
              key={tema.id}
              id={tema.id}
              titulo={tema.titulo}
              texto={tema.texto}
              createdAt={tema.createdAt}
              ultimaActividad={tema.ultimaActividad}
              autor={tema.autor}
              numRespuestas={tema._count.respuestas}
              puedeBorrar={
                viewer.esAdmin || (viewer.userId === tema.autorId && tema._count.respuestas === 0)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
