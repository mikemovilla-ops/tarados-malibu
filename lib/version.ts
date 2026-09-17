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
    version: "1.10.0",
    fecha: "2026-09-17",
    cambios: [
      "Al entrar por primera vez con Google, ahora se va directo a Ajustes para rellenar apodo, posición y datos de contacto, en vez de quedarse en la home.",
      "En /ajustes puedes poner un email distinto para recibir avisos (si lo dejas en blanco, se usa el de tu login).",
      "Aviso por email a los admins cada vez que entra un jugador nuevo por primera vez (opcional: solo si el admin ha configurado el envío de correos).",
      "En /calendario, un partido pasa a \"Jugados\" cuando el admin cierra su jornada, no cuando pasa la fecha — así uno ya jugado pero pendiente de cerrar se sigue viendo en \"Próximos\".",
    ],
  },
  {
    version: "1.9.0",
    fecha: "2026-09-17",
    cambios: [
      "Nuevo fondo de playa (sol, olas y una palmera, a juego con el escudo) en vez del campo de fútbol.",
      "Nueva página /novedades con el historial completo de versiones (el pop-up de al entrar solo enseña lo nuevo desde tu última visita).",
    ],
  },
  {
    version: "1.8.0",
    fecha: "2026-09-17",
    cambios: [
      "En móvil, la barra de navegación de abajo pasa a un estilo \"flotante\" (con márgenes y sombra, sin tocar los bordes de la pantalla).",
      "Al arrancar en local (npm run dev) se muestra la IP de la red local, para poder abrir la app desde el móvil en la misma WiFi sin ir a buscarla a mano.",
    ],
  },
  {
    version: "1.7.0",
    fecha: "2026-09-17",
    cambios: [
      "En /ajustes puedes elegir tu propia posición, junto al apodo (el admin puede seguir corrigiéndola desde Plantilla).",
      "La camiseta de cada jugador en /plantilla se ve más grande, para leer mejor el apodo y el dorsal.",
      "Una vez el admin cierra la jornada de un partido, la respuesta \"¿Vas?\" queda bloqueada — el resto (resultado, convocatoria, goles, tarjetas) lo puede seguir corrigiendo por si hubiera errores.",
    ],
  },
  {
    version: "1.6.0",
    fecha: "2026-09-17",
    cambios: [
      "En /ajustes, teléfono, DNI y fecha de nacimiento pasan a un único formulario.",
      "Las tarjetas amarillas y rojas de cada jugador se ven también en /estadisticas.",
    ],
  },
  {
    version: "1.5.0",
    fecha: "2026-09-17",
    cambios: [
      "Crear un partido nuevo y añadir un jugador a mano se hacen ahora en una ventana emergente, en vez de un formulario que empuja el resto de la página.",
      "El admin ve el DNI y la fecha de nacimiento de cada jugador desde /plantilla.",
      "Responder \"Voy\" a un partido te convoca directamente (y \"No voy\" te desconvoca), sin que el admin tenga que repetir el tick a mano.",
      "Nuevo: tarjeta amarilla y tarjeta roja por jugador y partido, en la convocatoria.",
    ],
  },
  {
    version: "1.4.0",
    fecha: "2026-09-17",
    cambios: [
      "Nuevo en /ajustes: DNI y fecha de nacimiento, para la inscripción del equipo.",
      "Al crear un partido de Liga se puede indicar la jornada; el calendario sigue ordenando por fecha (por si hay aplazamientos). El admin puede corregir cualquier dato de un partido ya creado.",
      "El admin puede marcar la disponibilidad de un jugador de ayuda a mano; si confirma que viene, se suma al recuento de \"van\" indicando cuántos son de ayuda.",
    ],
  },
  {
    version: "1.3.0",
    fecha: "2026-09-17",
    cambios: [
      "En la página principal se destacan los partidos futuros a los que todavía no has respondido si vas.",
      "Las estadísticas no cuentan un partido hasta que el admin cierra su jornada, y no deja cerrarla si los goles asignados no cuadran con el resultado.",
    ],
  },
  {
    version: "1.2.0",
    fecha: "2026-09-17",
    cambios: [
      "La plantilla se divide ahora en Activos y de Ayuda; el admin puede añadir jugadores a mano sin que tengan que loguearse con Google.",
      "Cada jugador puede ponerse un apodo, que sustituye a su nombre de Google en el resto de la app.",
      "Los pagos pasan de una cuota mensual a tres secciones fijas: Inscripción, Equipación y Material.",
    ],
  },
  {
    version: "1.1.0",
    fecha: "2026-09-17",
    cambios: ["Escudo del equipo y colores amarillos (el color de la equipación) en toda la app."],
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
