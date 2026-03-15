"use client";

import { motion } from "framer-motion";

export interface SparkLineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function SparkLine({
  data,
  color = "var(--accent)",
  height = 32,
  width = 80,
}: SparkLineProps) {
  if (!data.length) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = height - 4;
  const w = width - 4;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1 || 1)) * w + 2;
      const y = h + 2 - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const polyPoints = points.split(" ");
  const lastX = polyPoints[polyPoints.length - 1]?.split(",")[0] ?? w + 2;
  const polygonPoints = `2,${height - 2} ${points} ${lastX},${height - 2}`;

  return (
    <motion.svg
      width={width}
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="sparkline-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ vectorEffect: "non-scaling-stroke" }}
      />
      <polygon
        fill="url(#sparkline-grad)"
        points={polygonPoints}
      />
    </motion.svg>
  );
}
