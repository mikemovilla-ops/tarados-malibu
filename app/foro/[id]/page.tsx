import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
import { estaAlDiaDePago } from "@/lib/pagos";
import { puedeEscribirForo, esNoLeido } from "@/lib/foro";
import { nombreMostrado } from "@/lib/jugadores";
import { formatFechaHora } from "@/lib/fechas";
import FormNuevoMensajeForo from "@/components/FormNuevoMensajeForo";
import BotonBorrarMensajeForo from "@/components/BotonBorrarMensajeForo";
import EditarTemaForo from "@/components/EditarTemaForo";
import ForoAcceso from "@/components/ForoAcceso";

export const dynamic = "force-dynamic";

export default async function TemaForoPage({ params }: { params: { id: string } }) {
  const viewer = await getViewer();

  if (!viewer.session) {
    return <ForoAcceso logueado={false} />;
  }

  if (viewer.necesitaElegirRol) {
    redirect("/ajustes");
  }

  // Un "no jugador" sin cuota pagada no puede ni leer los temas — igual que
  // quien no ha entrado con Google.
  if (viewer.rol === "NO_JUGADOR") {
    return <ForoAcceso logueado={true} />;
  }

  const tema = await prisma.mensajeForo.findUnique({
    where: { id: params.id },
    include: {
      autor: { select: { name: true, apodo: true } },
      respuestas: {
        orderBy: { createdAt: "asc" },
        include: { autor: { select: { name: true, apodo: true } } },
      },
    },
  });

  // Si el id es el de una respuesta suelta, no de un tema, no hay página
  // propia para ella — el debate vive en la página de su tema.
  if (!tema || tema.padreId !== null) notFound();

  // Hay que leer la última visita ANTES de marcar el tema como leído ahora
  // mismo (más abajo), para poder saber qué respuestas son nuevas desde
  // entonces — si se marcara primero, se perdería el dato de qué es "viejo".
  const lecturaAnterior = await prisma.lecturaForo.findUnique({
    where: { userId_temaId: { userId: viewer.userId!, temaId: tema.id } },
  });
  const leidoEnAnterior = lecturaAnterior?.leidoEn ?? null;

  await prisma.lecturaForo.upsert({
    where: { userId_temaId: { userId: viewer.userId!, temaId: tema.id } },
    update: { leidoEn: new Date() },
    create: { userId: viewer.userId!, temaId: tema.id, leidoEn: new Date() },
  });

  const alDiaDePago =
    viewer.alDiaDePago ?? (viewer.rol === "SOCIO" ? await estaAlDiaDePago(viewer.userId!, "SOCIO") : true);
  const puedeEscribir = puedeEscribirForo({ logueado: true, rol: viewer.rol, alDiaDePago });

  // Quien abrió el tema puede editarlo siempre, y borrarlo mientras nadie
  // le haya respondido; el admin puede borrar cualquier tema en cualquier
  // momento (ver la misma regla en app/api/foro/[id]/route.ts).
  const esAutorTema = viewer.userId === tema.autorId;
  const puedeEditarTema = esAutorTema;
  const puedeBorrarTema = viewer.esAdmin || (esAutorTema && tema.respuestas.length === 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/foro" className="text-chalk/50 text-sm hover:underline">
        ← Foro
      </Link>

      <div className="card p-4 space-y-2">
        <h1 className="font-display text-xl">{tema.titulo ?? tema.texto}</h1>
        <div className="flex items-center justify-between gap-2">
          <span className="text-chalk/60 text-sm">{nombreMostrado(tema.autor)}</span>
          <span className="text-chalk/40 text-xs shrink-0">{formatFechaHora(tema.createdAt)}</span>
        </div>
        {tema.titulo && <p className="text-chalk/90 text-sm whitespace-pre-wrap">{tema.texto}</p>}
        <div className="flex items-center gap-3">
          {puedeEditarTema && (
            <EditarTemaForo id={tema.id} tituloInicial={tema.titulo ?? ""} textoInicial={tema.texto} />
          )}
          {puedeBorrarTema && <BotonBorrarMensajeForo id={tema.id} esTema />}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">
          {tema.respuestas.length === 0
            ? "Sin respuestas"
            : `${tema.respuestas.length} respuesta${tema.respuestas.length === 1 ? "" : "s"}`}
        </h2>
        {tema.respuestas.map((r) => {
          const noLeido = r.autorId !== viewer.userId && esNoLeido(r.createdAt, leidoEnAnterior);
          return (
            <div key={r.id} className={`card p-4 space-y-1 ${noLeido ? "border-amarillo/50" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-chalk text-sm font-display flex items-center gap-2">
                  {noLeido && <span className="w-1.5 h-1.5 rounded-full bg-amarillobrillante shrink-0" />}
                  {nombreMostrado(r.autor)}
                </span>
                <span className="text-chalk/40 text-xs shrink-0">{formatFechaHora(r.createdAt)}</span>
              </div>
              <p className="text-chalk/80 text-sm whitespace-pre-wrap">{r.texto}</p>
              {viewer.esAdmin && <BotonBorrarMensajeForo id={r.id} />}
            </div>
          );
        })}
      </section>

      {puedeEscribir ? (
        <div className="card p-4">
          <FormNuevoMensajeForo padreId={tema.id} placeholder="Escribe una respuesta..." />
        </div>
      ) : (
        <div className="card p-4 border-coral/40">
          <p className="text-coral text-sm">
            Para responder hace falta estar al día con la cuota de socio — puedes conocerla en{" "}
            <Link href="/pagos" className="underline">
              Pagos
            </Link>
            . Consulta con alguien del equipo para más información.
          </p>
        </div>
      )}
    </div>
  );
}
