import { prisma } from "@/lib/prisma";
import { getSecciones, type Seccion } from "@/lib/pagos";
import { nombreMostrado } from "@/lib/jugadores";
import { getViewer } from "@/lib/viewer";
import SeccionAdmin from "@/components/SeccionAdmin";
import { FormImportePago, TogglePago, FormNuevaSeccion } from "@/components/PagosAdmin";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

type Persona = { id: string; name: string | null; apodo: string | null; dorsal: number | null; rol?: string };
type Pago = { userId: string; seccionId: string; pagado: boolean };

export default async function PagosPage() {
  const { session, userId, esAdmin, rol, estado } = await getViewer();

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Pagos</h1>
        <p className="text-chalk/60">Entra con Google para ver el estado de tus pagos.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  if (!esAdmin) {
    if (rol === "JUGADOR" && estado !== "ACTIVO") {
      return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-3">
          <h1 className="font-display text-2xl">Pagos</h1>
          <p className="text-chalk/50 text-sm">Los pagos del equipo son solo para jugadores activos.</p>
        </div>
      );
    }

    // Un socio y un "no jugador" (todavía sin cuota pagada) pagan dentro de
    // la misma sección de socio.
    const destinoSecciones = rol === "JUGADOR" ? "JUGADOR" : "SOCIO";
    const secciones = await getSecciones(destinoSecciones);
    const misPagos = await prisma.pago.findMany({ where: { userId: userId! } });

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="font-display text-2xl">Tus pagos</h1>
        {secciones.length === 0 && rol !== "JUGADOR" && (
          <p className="text-chalk/50 text-sm">Todavía no hay ninguna cuota de socio configurada.</p>
        )}
        <div className="space-y-2">
          {secciones.map((seccion) => {
            const pago = misPagos.find((p) => p.seccionId === seccion.id);
            const pagado = pago?.pagado ?? false;
            const importe = pago?.importe ?? seccion.importe;
            return (
              <div key={seccion.id} className="card p-4 flex items-center justify-between">
                <span className="text-chalk">{seccion.nombre}</span>
                <span className={pagado ? "text-amarillobrillante text-sm" : "text-coral text-sm"}>
                  {pagado ? "Pagado" : `Pendiente (${importe.toFixed(2)} €)`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function BloquePagos({
    titulo,
    destinatario,
    secciones,
    personas,
    pagos,
    sinPersonasTexto,
    nota,
  }: {
    titulo: string;
    destinatario: "JUGADOR" | "SOCIO";
    secciones: Seccion[];
    personas: Persona[];
    pagos: Pago[];
    sinPersonasTexto: string;
    nota?: string;
  }) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">
            {titulo} <span className="text-chalk/50 text-sm font-body">({personas.length})</span>
          </h2>
          <FormNuevaSeccion destinatario={destinatario} />
        </div>
        {nota && <p className="text-chalk/40 text-xs -mt-2">{nota}</p>}

        {secciones.length === 0 && <p className="text-chalk/50 text-sm">Todavía no hay ninguna sección creada.</p>}

        {secciones.map((seccion) => (
          <SeccionAdmin key={seccion.id} eyebrow="Sección" titulo={seccion.nombre}>
            <FormImportePago seccionId={seccion.id} importeInicial={seccion.importe} />
            {personas.length === 0 ? (
              <p className="text-chalk/50 text-sm">{sinPersonasTexto}</p>
            ) : (
              <div className="space-y-2 pt-2">
                {personas.map((p) => {
                  const pago = pagos.find((pg) => pg.userId === p.id && pg.seccionId === seccion.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-3">
                      <span className="text-chalk text-sm truncate">
                        {p.dorsal !== null && <span className="text-amarillobrillante font-display">#{p.dorsal} </span>}
                        {nombreMostrado(p)}
                        {p.rol === "NO_JUGADOR" && (
                          <span className="text-chalk/40 text-xs"> (no jugador, sin cuota todavía)</span>
                        )}
                      </span>
                      <TogglePago userId={p.id} seccionId={seccion.id} pagadoInicial={pago?.pagado ?? false} />
                    </div>
                  );
                })}
              </div>
            )}
          </SeccionAdmin>
        ))}
      </section>
    );
  }

  const [secciones, activos, socios] = await Promise.all([
    getSecciones(),
    prisma.user.findMany({
      where: { estado: "ACTIVO", rol: "JUGADOR" },
      orderBy: [{ dorsal: "asc" }, { name: "asc" }],
      select: { id: true, name: true, apodo: true, dorsal: true },
    }),
    prisma.user.findMany({
      where: { rol: { in: ["SOCIO", "NO_JUGADOR"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, apodo: true, dorsal: true, rol: true },
    }),
  ]);

  const seccionesJugador = secciones.filter((s) => s.destinatario === "JUGADOR");
  const seccionesSocio = secciones.filter((s) => s.destinatario === "SOCIO");

  const pagos = await prisma.pago.findMany({
    where: { userId: { in: [...activos, ...socios].map((p) => p.id) } },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <h1 className="font-display text-2xl">Pagos</h1>

      <BloquePagos
        titulo="Jugadores"
        destinatario="JUGADOR"
        secciones={seccionesJugador}
        personas={activos}
        pagos={pagos}
        sinPersonasTexto="No hay jugadores activos todavía."
      />

      <BloquePagos
        titulo="Socios"
        destinatario="SOCIO"
        secciones={seccionesSocio}
        personas={socios}
        pagos={pagos}
        sinPersonasTexto="No hay socios todavía."
        nota="Incluye a quien todavía no juega pero ha dicho que no es jugador (sin cuota pagada) — al marcarle aquí toda su cuota como pagada, pasa a ser Socio solo."
      />
    </div>
  );
}
