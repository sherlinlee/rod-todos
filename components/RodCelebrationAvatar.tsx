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
        <ellipse cx="40" cy="74" rx="18" ry="4" fill="#1A3A5C" opacity="0.12" />

        <rect x="24" y="56" width="32" height="16" rx="5" fill="#FF7A1A" />
        <path d="M24 62h32" stroke="#E85D04" strokeWidth="1.5" />

        <path
          d="M22 58c-5 2-7 8-4 12"
          stroke="#F4C98D"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M58 58c5 2 7 8 4 12"
          stroke="#F4C98D"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="20" cy="70" r="4" fill="#F4C98D" />
        <circle cx="60" cy="70" r="4" fill="#F4C98D" />

        <circle cx="40" cy="44" r="13" fill="#F4C98D" />
        <path d="M28 34c1-7 5-11 12-11s11 4 12 11" fill="#FFD54F" />
        <path
          d="M30 26c2-5 4-8 10-8s8 3 10 8c-2.5 1-5 1.5-10 1.5S32.5 27 30 26z"
          fill="#F5B800"
        />
        <path
          d="M31 38.5h18c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5H31c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5z"
          fill="#1A1A2E"
        />
        <rect x="32" y="40" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.9" />
        <rect x="42" y="40" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.9" />
        <path
          d="M36 50c2 2 6 2 8 0"
          stroke="#5C3D1E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M26 54c-2-10 2-18 10-20"
          stroke="#F4C98D"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M54 54c2-10-2-18-10-20"
          stroke="#F4C98D"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <circle cx="28" cy="34" r="4.5" fill="#F4C98D" />
        <circle cx="52" cy="34" r="4.5" fill="#F4C98D" />

        <g>
          <path
            d="M40 14c-3.5 0-6 2.5-6 6v2.5h12V20c0-3.5-2.5-6-6-6z"
            fill="#FFD54F"
          />
          <path d="M34 22.5h12v5H34z" fill="#F5B800" />
          <path
            d="M36.5 27.5h7v3.5c0 1.8-1.2 3-3.5 3s-3.5-1.2-3.5-3v-3.5z"
            fill="#FF7A1A"
          />
          <rect x="36" y="31" width="8" height="2.5" rx="1" fill="#E85D04" />
          <path
            d="M31 21c-2.5 0-4 1.5-4 4s1.5 4 4 4"
            stroke="#FFD54F"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M49 21c2.5 0 4 1.5 4 4s-1.5 4-4 4"
            stroke="#FFD54F"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}
