import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
import FilaJugador from "@/components/FilaJugador";
import FormNuevoJugadorManual from "@/components/FormNuevoJugadorManual";
import SeccionDesplegable from "@/components/SeccionDesplegable";

export const dynamic = "force-dynamic";

export default async function PlantillaPage() {
  const { esAdmin } = await getViewer();

  // dni/fechaNacimiento solo se piden (y por tanto solo llegan al HTML) si
  // quien mira la página es admin — para cualquier otro jugador ni siquiera
  // viajan en la respuesta, aunque la UI no los fuera a pintar.
  const usuarios = await prisma.user.findMany({
    orderBy: [{ dorsal: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      apodo: true,
      email: true,
      dorsal: true,
      posicion: true,
      estado: true,
      rol: true,
      ...(esAdmin ? { dni: true, fechaNacimiento: true } : {}),
    },
  });

  const jugadores = usuarios.filter((j) => j.rol === "JUGADOR");
  const activos = jugadores.filter((j) => j.estado === "ACTIVO");
  const ayudas = jugadores.filter((j) => j.estado === "AYUDA");
  const socios = usuarios.filter((j) => j.rol === "SOCIO");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Plantilla</h1>
          <p className="text-chalk/60 text-sm">
            {activos.length} activos · {ayudas.length} de ayuda
            {socios.length > 0 && ` · ${socios.length} socios`}
          </p>
        </div>
        {esAdmin && <FormNuevoJugadorManual />}
      </div>

      {usuarios.length === 0 && (
        <p className="text-chalk/50 text-sm">
          Todavía no ha entrado nadie con Google. Los jugadores aparecen aquí en cuanto se registran.
        </p>
      )}

      <SeccionDesplegable titulo="Activos">
        {activos.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay jugadores activos.</p>
        ) : (
          <div className="space-y-2">
            {activos.map((j) => (
              <FilaJugador key={j.id} jugador={j} esAdmin={esAdmin} />
            ))}
          </div>
        )}
      </SeccionDesplegable>

      <SeccionDesplegable titulo="Ayuda">
        {ayudas.length === 0 ? (
          <p className="text-chalk/50 text-sm">No hay jugadores de ayuda apuntados.</p>
        ) : (
          <div className="space-y-2">
            {ayudas.map((j) => (
              <FilaJugador key={j.id} jugador={j} esAdmin={esAdmin} />
            ))}
          </div>
        )}
      </SeccionDesplegable>

      {socios.length > 0 && (
        <SeccionDesplegable titulo="Socios">
          <div className="space-y-2">
            {socios.map((j) => (
              <FilaJugador key={j.id} jugador={j} esAdmin={esAdmin} />
            ))}
          </div>
        </SeccionDesplegable>
      )}
    </div>
  );
}
