import RodAvatar from "@/components/RodAvatar";

export default function RodCelebrationAvatar({ size = 96 }: { size?: number }) {
  const rodSize = Math.round(size * 0.7);

  return (
    <div
      className="inline-flex items-end justify-center gap-1.5 animate-celebration-float"
      role="img"
      aria-label="Rod celebrating with a trophy"
    >
      <RodAvatar size={rodSize} />
      <span
        className="mb-1 leading-none drop-shadow-sm"
        style={{ fontSize: Math.round(rodSize * 0.85) }}
        aria-hidden
      >
        🏆
      </span>
    </div>
  );
}
