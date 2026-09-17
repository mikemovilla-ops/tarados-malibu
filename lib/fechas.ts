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

// "YYYY-MM" del mes actual, para generar/filtrar cuotas.
export function mesActual(): string {
  const ahora = new Date();
  return `${ahora.getFullYear()}-${(ahora.getMonth() + 1).toString().padStart(2, "0")}`;
}

export function formatMes(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  return `${MESES[m - 1]} ${anio}`;
}
