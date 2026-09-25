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
      <defs>
        <linearGradient id="camisetaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDE66" />
          <stop offset="100%" stopColor="#F2B705" />
        </linearGradient>
      </defs>
      <path
        d="M38,11 Q44,20 50,23 Q56,20 62,11
           C72,12 86,16 96,28
           Q100,34 90,40
           C82,38 76,36 73,34
           L73,98
           C73,102 70,104 66,104
           L34,104
           C30,104 27,102 27,98
           L27,34
           C24,36 18,38 10,40
           Q0,34 4,28
           C14,16 28,12 38,11 Z"
        fill="url(#camisetaGrad)"
        stroke="#5B1F1F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M38,11 Q44,20 50,23 Q56,20 62,11"
        fill="none"
        stroke="#5B1F1F"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="50"
        y="38"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="#FFFFFF"
        className="font-display"
        textLength="36"
        lengthAdjust="spacingAndGlyphs"
      >
        {nombre.toUpperCase()}
      </text>
      <text x="50" y="82" textAnchor="middle" fontSize="38" fontWeight="700" fill="#FFFFFF" className="font-display">
        {dorsal ?? "-"}
      </text>
    </svg>
  );
}
