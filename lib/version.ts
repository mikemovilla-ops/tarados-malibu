// Historial de versiones de la app. Añade una entrada nueva ARRIBA del todo
// cada vez que despliegues una mejora — `APP_VERSION` se calcula siempre a
// partir de la primera entrada, así que no hace falta tocar nada más. El
// pop-up de novedades (components/VersionPopup.tsx) usa este mismo listado
// para mostrar, a cada usuario, lo que ha cambiado desde la última vez que
// entró.
export type Cambio =
  | string
  | {
      texto: string;
      // Se pinta como una etiqueta destacada al lado del texto, p.ej.
      // "Sugerencia de un usuario" — para dar crédito a de dónde vino la idea.
      origen: string;
    };

export type EntradaVersion = {
  version: string;
  fecha: string; // YYYY-MM-DD
  cambios: Cambio[];
  // Marca un hito — /novedades y el pop-up dibujan una línea divisoria justo
  // encima de esta entrada para separarla visualmente de las anteriores.
  hito?: boolean;
};

export const HISTORIAL_VERSIONES: EntradaVersion[] = [
  {
    version: "2.0.0",
    fecha: "2026-09-25",
    hito: true,
    cambios: [
      "Nuevo perfil de Socio: acceso de solo lectura a plantilla, calendario y estadísticas, sin convocatorias ni disponibilidad, con su propia cuota en Pagos.",
      "Al entrar por primera vez, se pregunta \"¿vienes a jugar o eres socio?\" para clasificarte tú mismo (el admin siempre puede corregirlo desde Plantilla).",
      "Anuncio fijable en la home, gestionado por el admin.",
      "El admin puede borrar del todo a un jugador o socio, con confirmación.",
      "Tablón de mensajes: cualquiera abre temas y responde; un socio con la cuota pendiente puede leerlo pero no escribir.",
      "Vista previa local (solo admin, solo fuera de producción) para ver la app como jugador activo, de ayuda, o socio con la cuota pagada o pendiente.",
      "Plantilla y Pagos: las distintas secciones ahora se pliegan y despliegan.",
    ],
  },
  {
    version: "1.1.0",
    fecha: "2026-09-25",
    cambios: [
      "Quitado \"titular\" de la convocatoria; en calendario ahora se ve Competición + Jornada, y el escudo va sin fondo.",
      "Gestión de goles en propia puerta y aviso por email cuando se crea un partido nuevo.",
      "El admin ve la jornada cerrada como un jugador más, con opción de seguir editando cada sección.",
      "Indicador de carga al navegar en móvil, para evitar toques repetidos mientras carga la página.",
      "El admin puede crear nuevas secciones de pago (ya no son solo Inscripción, Equipación y Material).",
      "Botón para refrescar la página actual en la barra de arriba, en móvil.",
      "Camisetas de la plantilla más cuidadas (mangas y cuello redondeados, degradado) y con vista previa en vivo al editar apodo/dorsal.",
    ],
  },
  {
    version: "1.0.0",
    fecha: "2026-09-17",
    hito: true,
    cambios: [
      "🎉 Primera versión de Tarados Malibú: plantilla, calendario con convocatorias/goles/asistencias, estadísticas y pagos.",
    ],
  },
];

export const APP_VERSION = HISTORIAL_VERSIONES[0].version;
