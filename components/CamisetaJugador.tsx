// Camiseta amarilla (color del equipo) con el nombre/apodo y el dorsal del
// jugador, tal como los tiene rellenos — sustituye a la foto de Google en
// /plantilla. `textLength` fuerza el nombre a caber en el ancho de la
// camiseta aunque sea largo, en vez de desbordarse.
export default function CamisetaJugador({
  dorsal,
  nombre,
  size = 48,
}: {
  dorsal: number | null;
  nombre: string;
  size?: number;
}) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 100 110" className="shrink-0">
      <path
        d="M30 8 L42 8 Q50 17 58 8 L70 8 L93 25 L79 40 L73 33 L73 102 L27 102 L27 33 L21 40 L7 25 Z"
        fill="#F2B705"
        stroke="#5B1F1F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <text
        x="50"
        y="34"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#5B1F1F"
        className="font-display"
        textLength="44"
        lengthAdjust="spacingAndGlyphs"
      >
        {nombre.toUpperCase()}
      </text>
      <text x="50" y="82" textAnchor="middle" fontSize="38" fontWeight="700" fill="#072A20" className="font-display">
        {dorsal ?? "-"}
      </text>
    </svg>
  );
}
