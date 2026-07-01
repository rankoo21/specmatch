"use client";

// A crisp SVG depth scale with fine engraved markers. Shows depth 0 (surface)
// to deep, with numeric reference and region bands.
interface DepthScaleProps {
  height?: number;
  className?: string;
}

export function DepthScale({ height = 600, className = "" }: DepthScaleProps) {
  const ticks = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg
      width="44"
      height={height}
      viewBox={`0 0 44 ${height}`}
      className={className}
      role="img"
      aria-label="Depth scale, surface to deep"
    >
      <defs>
        <linearGradient id="scaleFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CDB089" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3FA89B" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <line x1="10" y1="6" x2="10" y2={height - 6} stroke="url(#scaleFade)" strokeWidth="1" />
      {ticks.map((t) => {
        const y = 6 + (t / 10) * (height - 12);
        const major = t % 5 === 0;
        return (
          <g key={t}>
            <line
              x1="10"
              y1={y}
              x2={major ? 24 : 18}
              y2={y}
              stroke="#CDB089"
              strokeOpacity={major ? 0.8 : 0.4}
              strokeWidth="1"
            />
            {major && (
              <text
                x="28"
                y={y + 3}
                fontSize="8"
                fill="#8C8A82"
                fontFamily="var(--font-mark), monospace"
              >
                {t * 100}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
