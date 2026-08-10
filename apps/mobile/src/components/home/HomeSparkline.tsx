import { useMemo } from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";

interface HomeSparklineProps {
  width?: number;
  height?: number;
  values: number[];
}

function toPoints(values: number[], width: number, height: number) {
  const padding = 4;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const max = Math.max(...values, 0.01);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * innerW;
    const normalized = (value - min) / range;
    const y = padding + innerH - normalized * innerH;
    return { x, y };
  });
}

function toStrokePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "M 0 0";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    path += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return path;
}

function toAreaPath(
  points: { x: number; y: number }[],
  width: number,
  height: number,
) {
  if (points.length === 0) return "M 0 0";
  const stroke = toStrokePath(points);
  const last = points[points.length - 1];
  const first = points[0];
  return `${stroke} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

export function HomeSparkline({
  width = 108,
  height = 56,
  values,
}: HomeSparklineProps) {
  const { colors, isDark } = useTheme();
  const stroke = isDark ? "#E2E8F0" : "#334155";

  const { fillPath, strokePath } = useMemo(() => {
    const points = toPoints(values, width, height);
    return {
      fillPath: toAreaPath(points, width, height),
      strokePath: toStrokePath(points),
    };
  }, [values, width, height]);

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="homeSparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={stroke} stopOpacity={0.18} />
          <Stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill="url(#homeSparkFill)" />
      <Path
        d={strokePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
