import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ETIQUETA_POSICION } from "@/lib/posiciones";
import { ETIQUETA_ESTADO } from "@/lib/estados";
import { COOKIE_VISTA_PREVIA } from "@/lib/viewer";
import EditarApodo from "@/components/EditarApodo";
import EditarDatosPersonales from "@/components/EditarDatosPersonales";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import VistaPreviaSelector from "@/components/VistaPreviaSelector";
import ElegirRolInicial from "@/components/ElegirRolInicial";

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
      rol: true,
      rolElegido: true,
      dni: true,
      fechaNacimiento: true,
    },
  });

  const esSocio = usuario.rol === "SOCIO";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-2xl">Ajustes</h1>

      {!usuario.rolElegido && <ElegirRolInicial />}

      <section className="card p-5 space-y-1">
        <p className="text-chalk">{usuario.name}</p>
        <p className="text-chalk/50 text-sm">{usuario.email}</p>
        {esSocio ? (
          <p className="text-chalk/50 text-sm">Socio</p>
        ) : (
          <>
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
          </>
        )}
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-display text-base">{esSocio ? "Apodo" : "Apodo y posición"}</h2>
        <p className="text-chalk/50 text-xs">
          El apodo es cómo te ve el resto del equipo en la plantilla, el calendario{esSocio ? "" : ", las estadísticas"}
          {" y los pagos"} (déjalo en blanco para usar tu nombre de Google).
          {!esSocio && " El admin también puede corregir tu posición desde Plantilla si hace falta."}
        </p>
        <EditarApodo apodoInicial={usuario.apodo ?? ""} posicionInicial={usuario.posicion ?? ""} esSocio={esSocio} />
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-display text-base">Contacto{!esSocio && " e inscripción"}</h2>
        <p className="text-chalk/50 text-xs">
          Solo los ves tú — se usan para localizarte{!esSocio && ", para inscribirte en la liga/seguro del equipo"} y,
          el email de avisos, para recibir notificaciones si es distinto del de tu login (si lo dejas en blanco se
          usa ese).
        </p>
        <EditarDatosPersonales
          telefonoInicial={usuario.telefono ?? ""}
          emailLogin={usuario.email ?? ""}
          emailNotificacionesInicial={usuario.emailNotificaciones ?? ""}
          dniInicial={usuario.dni ?? ""}
          fechaNacimientoInicial={usuario.fechaNacimiento ? usuario.fechaNacimiento.toISOString().slice(0, 10) : ""}
          esSocio={esSocio}
        />
      </section>

      {session.user.isAdmin && process.env.VERCEL_ENV !== "production" && (
        <section className="card p-5 space-y-2">
          <h2 className="font-display text-base">Vista previa (solo local)</h2>
          <p className="text-chalk/50 text-xs">
            Solo para ti, solo en local: hace que veas el resto de la app como vería un jugador activo, uno de ayuda
            o un socio, sin tocar tu usuario real ni el de nadie. No cambia ningún permiso de verdad — nunca
            funciona en producción.
          </p>
          <VistaPreviaSelector actual={cookies().get(COOKIE_VISTA_PREVIA)?.value ?? ""} />
        </section>
      )}
    </div>
  );
}
