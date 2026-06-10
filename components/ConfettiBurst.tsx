"use client";

import { useMemo } from "react";

const COLORS = ["#ff7a1a", "#ffd54f", "#6bb8ff", "#8ee4c8", "#2fa86f"];

type ConfettiBurstProps = {
  seed: number;
};

export default function ConfettiBurst({ seed }: ConfettiBurstProps) {
  const pieces = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${10 + ((seed * 37 + i * 19) % 80)}%`,
      delay: `${(i % 6) * 0.04}s`,
      color: COLORS[(seed + i) % COLORS.length],
      rotate: `${(seed * 13 + i * 41) % 360}deg`,
    }));
  }, [seed]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      aria-hidden
    >
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="animate-confetti absolute top-24 h-2.5 w-1.5 rounded-sm"
          style={{
            left: piece.left,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            transform: `rotate(${piece.rotate})`,
          }}
        />
      ))}
    </div>
  );
}
