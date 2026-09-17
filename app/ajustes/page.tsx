import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ETIQUETA_POSICION } from "@/lib/posiciones";
import { ETIQUETA_ESTADO } from "@/lib/estados";
import EditarApodo from "@/components/EditarApodo";
import EditarDatosPersonales from "@/components/EditarDatosPersonales";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Ajustes</h1>
        <p className="text-chalk/60">Entra con Google para ver y editar tus datos.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  const usuario = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      apodo: true,
      email: true,
      dorsal: true,
      posicion: true,
      telefono: true,
      emailNotificaciones: true,
      estado: true,
      dni: true,
      fechaNacimiento: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-2xl">Ajustes</h1>

      <section className="card p-5 space-y-1">
        <p className="text-chalk">{usuario.name}</p>
        <p className="text-chalk/50 text-sm">{usuario.email}</p>
        <p className="text-chalk/50 text-sm">
          {usuario.dorsal !== null ? `Dorsal #${usuario.dorsal}` : "Sin dorsal asignado"}
          {" · "}
          {usuario.posicion ? ETIQUETA_POSICION[usuario.posicion] : "Sin posición"}
          {" · "}
          {ETIQUETA_ESTADO[usuario.estado]}
        </p>
        <p className="text-chalk/40 text-xs pt-1">
          El dorsal y si estás activo o de ayuda los gestiona el admin desde Plantilla.
        </p>
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-display text-base">Apodo y posición</h2>
        <p className="text-chalk/50 text-xs">
          El apodo es cómo te ve el resto del equipo en la plantilla, el calendario, las estadísticas y los pagos
          (déjalo en blanco para usar tu nombre de Google). El admin también puede corregir tu posición desde
          Plantilla si hace falta.
        </p>
        <EditarApodo apodoInicial={usuario.apodo ?? ""} posicionInicial={usuario.posicion ?? ""} />
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-display text-base">Contacto e inscripción</h2>
        <p className="text-chalk/50 text-xs">
          Solo los ves tú — se usan para localizarte, para inscribirte en la liga/seguro del equipo y, el email de
          avisos, para recibir notificaciones si es distinto del de tu login (si lo dejas en blanco se usa ese).
        </p>
        <EditarDatosPersonales
          telefonoInicial={usuario.telefono ?? ""}
          emailLogin={usuario.email ?? ""}
          emailNotificacionesInicial={usuario.emailNotificaciones ?? ""}
          dniInicial={usuario.dni ?? ""}
          fechaNacimientoInicial={usuario.fechaNacimiento ? usuario.fechaNacimiento.toISOString().slice(0, 10) : ""}
        />
      </section>
    </div>
  );
}
