const tones = {
  default: {
    cover: "#E8D5F2",
    spine: "#D4B8E8",
    center: "#C9A6DC",
    lines: "#9B7BB8",
    accent: "#FF8FAB",
    accentOpacity: 0.6,
  },
  muted: {
    cover: "#F3EDE4",
    spine: "#E8E0D4",
    center: "#D9D0C4",
    lines: "#B8AEA0",
    accent: "#C9BFB0",
    accentOpacity: 0.45,
  },
} as const;

export default function BookAvatar({
  size = 28,
  tone = "default",
}: {
  size?: number;
  tone?: keyof typeof tones;
}) {
  const palette = tones[tone];

  return (
    <span
      className="inline-flex shrink-0 align-middle"
      role="img"
      aria-label="devotion book"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={tone === "muted" ? undefined : "drop-shadow-sm"}
      >
        <path
          d="M8 10c0-2 1.5-3.5 4-3.5 5 0 8 2 12 2s7-2 12-2c2.5 0 4 1.5 4 3.5v28c0 2-1.5 3-4 3-5 0-8-2-12-2s-7 2-12 2c-2.5 0-4-1-4-3V10z"
          fill={palette.cover}
        />
        <path
          d="M24 8.5c4 0 7 2 12 2 2 0 3.5 1 3.5 2.5v1.5c-5 0-8-2-12-2s-7 2-12 2V10.5c0-1.5 1.5-2 3.5-2 5 0 8-2 12-2z"
          fill={palette.spine}
        />
        <path d="M24 10.5v27" stroke={palette.center} strokeWidth="1.5" />
        <path
          d="M12 16h8M12 21h7M12 26h6"
          stroke={palette.lines}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M28 16h8M29 21h7M30 26h6"
          stroke={palette.lines}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10 38c4-1 8-2 14-2s10 1 14 2"
          stroke={palette.accent}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={palette.accentOpacity}
        />
      </svg>
    </span>
  );
}
