import { useMemo } from "react";

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export function RiskGauge({ score, size = 160 }: RiskGaugeProps) {
  const { color, label } = useMemo(() => {
    if (score <= 25) return { color: "hsl(var(--risk-low))", label: "Low" };
    if (score <= 50) return { color: "hsl(var(--risk-medium))", label: "Medium" };
    if (score <= 75) return { color: "hsl(var(--risk-high))", label: "High" };
    return { color: "hsl(var(--risk-critical))", label: "Critical" };
  }, [score]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`} aria-label={`Risk score: ${score} out of 100, ${label}`}>
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000 ease-out"
        />
        <text x={size / 2} y={size / 2 - 8} textAnchor="middle" className="fill-foreground text-3xl font-bold" fontSize="32">
          {score}
        </text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill={color} fontSize="14" fontWeight="600">
          {label}
        </text>
      </svg>
    </div>
  );
}
