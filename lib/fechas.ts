const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// El equipo juega en Madrid; el servidor (Vercel) corre en UTC. Todo lo que
// se muestra con hora (formatFecha, formatFechaHora, toInputDatetimeLocal)
// tiene que pasar por esta zona explícitamente — usar los getters locales
// de Date (getHours(), getDay()...) daría la hora del servidor, no la de
// Madrid, y se desplazaría 1-2h según la época del año (CET/CEST).
const ZONA_MADRID = "Europe/Madrid";

function partesEnMadrid(fecha: Date, opciones: Intl.DateTimeFormatOptions): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat("es-ES", { timeZone: ZONA_MADRID, ...opciones }).formatToParts(fecha);
}

function parte(partes: Intl.DateTimeFormatPart[], tipo: string): string {
  return partes.find((p) => p.type === tipo)?.value ?? "";
}

export function formatFecha(fecha: Date): string {
  const partes = partesEnMadrid(fecha, { weekday: "long", day: "numeric", month: "numeric" });
  const mes = Number(parte(partes, "month")) - 1;
  return `${parte(partes, "weekday")} ${parte(partes, "day")} de ${MESES[mes]}`;
}

export function formatFechaHora(fecha: Date): string {
  const partes = partesEnMadrid(fecha, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${formatFecha(fecha)}, ${parte(partes, "hour")}:${parte(partes, "minute")}`;
}

// Solo "HH:mm", en hora de Madrid — para la hora de convocatoria (ver
// horaConvocatoria más abajo), que ya va pegada a la fecha completa del
// partido y no necesita repetirla.
export function formatHora(fecha: Date): string {
  const partes = partesEnMadrid(fecha, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return `${parte(partes, "hour")}:${parte(partes, "minute")}`;
}

// Hora a la que hay que estar en el sitio: media hora antes del inicio.
export function horaConvocatoria(fechaPartido: Date): Date {
  return new Date(fechaPartido.getTime() - 30 * 60 * 1000);
}

// Formato que espera el valor de un <input type="datetime-local">
// ("YYYY-MM-DDTHH:mm"), en hora de Madrid — no usar toISOString() aquí, que
// da la hora en UTC y descuadraría con lo que ve el admin al editar.
export function toInputDatetimeLocal(fecha: Date): string {
  const partes = partesEnMadrid(fecha, {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  return `${parte(partes, "year")}-${parte(partes, "month")}-${parte(partes, "day")}T${parte(partes, "hour")}:${parte(partes, "minute")}`;
}

// Inverso de toInputDatetimeLocal: el admin escribe una hora en un
// <input type="datetime-local"> pensando en hora de Madrid (p.ej. "las 20:00
// del partido"), pero ese string no lleva zona horaria — JS lo interpretaría
// como hora local del entorno que ejecuta el código (UTC en Vercel), no como
// Madrid. Convierte ese valor al instante UTC correcto que corresponde a esa
// hora de pared en Madrid, teniendo en cuenta el cambio de horario
// (CET/CEST) según la fecha.
//
// Truco de ida y vuelta: se interpreta el string primero como si ya fuera
// UTC (una suposición de partida cualquiera), se mira qué hora sería esa en
// Madrid, y la diferencia entre ambas da el desfase real de Madrid en esa
// fecha — que se resta de la suposición para corregirla.
export function parseInputDatetimeLocalMadrid(valor: string): Date {
  const [fechaParte, horaParte] = valor.split("T");
  const [anio, mes, dia] = fechaParte.split("-").map(Number);
  const [hora, minuto] = (horaParte ?? "00:00").split(":").map(Number);

  const supuesta = new Date(Date.UTC(anio, mes - 1, dia, hora, minuto));
  const partes = partesEnMadrid(supuesta, {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  const comoSiFueraMadrid = Date.UTC(
    Number(parte(partes, "year")),
    Number(parte(partes, "month")) - 1,
    Number(parte(partes, "day")),
    Number(parte(partes, "hour")),
    Number(parte(partes, "minute"))
  );
  const desfaseMs = comoSiFueraMadrid - supuesta.getTime();
  return new Date(supuesta.getTime() - desfaseMs);
}

// DD/MM/YYYY, para fechas sin hora asociada (p.ej. fecha de nacimiento) que
// no pintan bien con el formato "jueves 17 de septiembre" de formatFecha.
// Usa los getters en UTC (no locales): estas fechas se guardan como
// medianoche UTC a partir de un <input type="date">, y leerlas con
// getDate()/getMonth() locales podría desplazar el día según la zona
// horaria del servidor.
export function formatFechaCorta(fecha: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(fecha.getUTCDate())}/${pad(fecha.getUTCMonth() + 1)}/${fecha.getUTCFullYear()}`;
}
