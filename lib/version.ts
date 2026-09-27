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
    fecha: "2026-09-28",
    hito: true,
    cambios: [
      "Nuevo perfil de Socio (paga cuota) y un estado intermedio de \"No jugador\" (contestó que no juega, todavía sin pagar) — los dos ven la plantilla, el calendario y las estadísticas, sin convocatorias ni disponibilidad, con su propia cuota en Pagos.",
      "Al entrar por primera vez se pregunta si eres jugador para clasificarte tú mismo (el admin siempre puede corregirlo desde Plantilla); mientras no contestes, no puedes responder disponibilidad ni entrar en el Foro, y se te sigue llevando a Ajustes cada vez que entras.",
      "Un \"no jugador\" pasa a Socio solo en cuanto el admin le registra el pago de su cuota — nadie puede autoasignarse Socio.",
      "Anuncio fijable en la home, gestionado por el admin.",
      "El admin puede borrar del todo a un jugador o socio, con confirmación.",
      "Foro: se abren temas (con título) y se comenta dentro de cada uno, ordenados por última actividad. Participan los jugadores y los socios al día de cuota; un \"no jugador\" sin pagar ve el Foro igual que quien no ha entrado con Google.",
      "Vista previa local (solo admin, solo fuera de producción) para ver la app como jugador activo, de ayuda, no jugador o socio.",
      "Plantilla y Pagos: las secciones se pliegan y despliegan; en Plantilla, el admin ve avisos de \"Sin clasificar\" y una sección aparte para quien no ha pagado la cuota de socio.",
      "En Plantilla y en Estadísticas, al pinchar en un jugador se abre su ficha con sus estadísticas y el partido a partido.",
      "En la home, el próximo partido y el aviso de \"responde si vas\" están unidos en una sola sección. \"Ver detalle\" (también del último resultado), las estadísticas (globales y de cada jugador) y el detalle de una jornada todavía abierta ahora piden haber entrado con Google.",
      "En el Foro, se puede borrar un tema directamente desde la lista, sin entrar en él; quien abre un tema puede editarlo (título y mensaje) cuando quiera, y borrarlo él mismo solo mientras nadie le haya respondido.",
      "Con la jornada cerrada ya no sale \"¿Vas?\" (deja de ser relevante); en su lugar, junto a la convocatoria se ven los \"No convocados\".",
      "Un jugador de ayuda ve \"Podría ir\" / \"Duda\" / \"No puedo ir\" en vez de \"Voy\" / \"Duda\" / \"No voy\".",
      "En Calendario, cada próximo partido enseña ya los botones de disponibilidad sin tener que entrar en el detalle, y \"Próximos\"/\"Jugados\" pasan a ser desplegables (Próximos abierto, Jugados plegado).",
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
