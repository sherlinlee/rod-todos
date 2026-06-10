export default function RodCelebrationAvatar({ size = 80 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 animate-celebration-float"
      role="img"
      aria-label="Rod celebrating with a trophy"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <ellipse cx="40" cy="72" rx="18" ry="4" fill="#1A3A5C" opacity="0.12" />

        <g className="animate-trophy-float">
          <path
            d="M40 6c-4 0-7 3-7 7v3h14v-3c0-4-3-7-7-7z"
            fill="#FFD54F"
          />
          <path d="M33 16h14v6H33z" fill="#F5B800" />
          <path
            d="M36 22h8v4c0 2-1.5 3.5-4 3.5s-4-1.5-4-3.5v-4z"
            fill="#FF7A1A"
          />
          <rect x="35" y="26" width="10" height="3" rx="1" fill="#E85D04" />
          <path
            d="M30 14c-3 0-5 2-5 5s2 5 5 5"
            stroke="#FFD54F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M50 14c3 0 5 2 5 5s-2 5-5 5"
            stroke="#FFD54F"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        <circle cx="40" cy="46" r="13" fill="#F4C98D" />
        <path
          d="M28 36c1-7 5-11 12-11s11 4 12 11"
          fill="#FFD54F"
        />
        <path
          d="M30 28c2-5 4-8 10-8s8 3 10 8c-2.5 1-5 1.5-10 1.5S32.5 29 30 28z"
          fill="#F5B800"
        />

        <path
          d="M31 40.5h18c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5H31c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5z"
          fill="#1A1A2E"
        />
        <rect x="32" y="42" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.9" />
        <rect x="42" y="42" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.9" />

        <path
          d="M36 52c2 2 6 2 8 0"
          stroke="#5C3D1E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <rect x="24" y="56" width="32" height="16" rx="5" fill="#FF7A1A" />
        <path d="M24 62h32" stroke="#E85D04" strokeWidth="1.5" />

        <path
          d="M18 54c-4 6-3 12 2 14"
          stroke="#F4C98D"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M62 54c4 6 3 12-2 14"
          stroke="#F4C98D"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="68" r="4" fill="#F4C98D" />
        <circle cx="62" cy="68" r="4" fill="#F4C98D" />
      </svg>
    </span>
  );
}
