const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatFecha(fecha: Date): string {
  const dia = DIAS[fecha.getDay()];
  return `${dia} ${fecha.getDate()} de ${MESES[fecha.getMonth()]}`;
}

export function formatFechaHora(fecha: Date): string {
  const hora = fecha.getHours().toString().padStart(2, "0");
  const min = fecha.getMinutes().toString().padStart(2, "0");
  return `${formatFecha(fecha)}, ${hora}:${min}`;
}

// Formato que espera el valor de un <input type="datetime-local">
// ("YYYY-MM-DDTHH:mm"), en hora local — no usar toISOString() aquí, que da
// la hora en UTC y descuadraría con lo que ve el admin al editar.
export function toInputDatetimeLocal(fecha: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}T${pad(fecha.getHours())}:${pad(fecha.getMinutes())}`;
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
