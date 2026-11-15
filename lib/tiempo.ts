import { fechaHoraMadrid } from "@/lib/fechas";

// Coordenadas de Madrid Río (donde se juega siempre, ver el valor por
// defecto de "lugar" al crear un partido) — de sobra de precisas para una
// previsión del tiempo.
const LAT = 40.3903;
const LON = -3.7238;

export type PrevisionTiempo = {
  temperatura: number; // ºC
  probabilidadLluvia: number; // %
  codigo: number; // código WMO de weathercode, ver ICONOS_TIEMPO
};

// https://open-meteo.com/en/docs#weathercode — solo los que de verdad
// pueden salir en la previsión horaria (no hace falta cubrir los 100 y pico
// códigos que existen).
const ICONOS_TIEMPO: Record<number, string> = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  53: "🌦️",
  55: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "🌨️",
  73: "🌨️",
  75: "🌨️",
  80: "🌦️",
  81: "🌧️",
  82: "⛈️",
  95: "⛈️",
  96: "⛈️",
  99: "⛈️",
};

export function iconoTiempo(codigo: number): string {
  return ICONOS_TIEMPO[codigo] ?? "🌡️";
}

// Open-Meteo no pide API key y da previsión horaria hasta unos 16 días
// vista — null si el partido cae fuera de ese rango (pasado, o demasiado
// lejos todavía) o si la petición falla por lo que sea; el tiempo es un
// extra, nunca debe romper la página de inicio.
export async function obtenerPrevisionPartido(fechaPartido: Date): Promise<PrevisionTiempo | null> {
  const { fecha, hora } = fechaHoraMadrid(fechaPartido);
  const hoy = fechaHoraMadrid(new Date()).fecha;
  if (fecha < hoy) return null;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&hourly=temperature_2m,precipitation_probability,weathercode` +
      `&timezone=Europe%2FMadrid&start_date=${fecha}&end_date=${fecha}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      hourly?: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weathercode: number[] };
    };
    const horas = data.hourly?.time ?? [];
    // `time` viene como "YYYY-MM-DDTHH:00" en la zona pedida (Europe/Madrid).
    const indice = horas.findIndex((t) => Number(t.slice(11, 13)) === hora);
    if (indice === -1 || !data.hourly) return null;

    return {
      temperatura: Math.round(data.hourly.temperature_2m[indice]),
      probabilidadLluvia: data.hourly.precipitation_probability[indice],
      codigo: data.hourly.weathercode[indice],
    };
  } catch {
    return null;
  }
}
