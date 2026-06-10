export default function RodCelebrationAvatar({ size = 96 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 animate-celebration-float"
      role="img"
      aria-label="Rod holding a trophy"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <ellipse cx="36" cy="84" rx="14" ry="3" fill="#1A3A5C" opacity="0.1" />

        <path
          d="M24 72v8c0 2 2.5 4 6 4h12c3.5 0 6-2 6-4v-8"
          fill="#2B5EA8"
        />
        <rect x="22" y="62" width="28" height="12" rx="4" fill="#FF7A1A" />
        <path d="M22 67h28" stroke="#E85D04" strokeWidth="1.2" />

        <path
          d="M14 60c-1 8 2 14 8 15"
          stroke="#F4C98D"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M58 60c1 8-2 14-8 15"
          stroke="#F4C98D"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        <path
          d="M18 56c4-6 10-9 18-9s14 3 18 9"
          stroke="#F4C98D"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <circle cx="18" cy="56" r="3.5" fill="#F4C98D" />
        <circle cx="54" cy="56" r="3.5" fill="#F4C98D" />

        <rect x="27" y="48" width="18" height="5" rx="1.5" fill="#E85D04" />
        <path
          d="M30 44h12c2 0 3.5 1.5 3.5 3.5v1H26.5V47.5C26.5 45.5 28 44 30 44z"
          fill="#FF7A1A"
        />
        <path
          d="M31 40h10c1.5 0 2.5 1 2.5 2.5v1.5H28.5V42.5C28.5 41 29.5 40 31 40z"
          fill="#FFD54F"
        />
        <path d="M32 36h8v4h-8z" fill="#F5B800" />
        <path
          d="M29 38c-2 0-3.5 1.2-3.5 3"
          stroke="#FFD54F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M43 38c2 0 3.5 1.2 3.5 3"
          stroke="#FFD54F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <circle cx="36" cy="28" r="11" fill="#F4C98D" />
        <path
          d="M26 20c1-6 4-10 10-10s9 4 10 10"
          fill="#FFD54F"
        />
        <path
          d="M28 14c1.5-4 3.5-6 8-6s6.5 2 8 6c-2 .8-4 1.2-8 1.2s-6-.4-8-1.2z"
          fill="#F5B800"
        />

        <path
          d="M28 27.5h16c1.8 0 3 1.2 3 2.8s-1.2 2.8-3 2.8H28c-1.8 0-3-1.2-3-2.8s1.2-2.8 3-2.8z"
          fill="#1A1A2E"
        />
        <rect x="29" y="28.5" width="5" height="2" rx="0.8" fill="#87CEEB" />
        <rect x="38" y="28.5" width="5" height="2" rx="0.8" fill="#87CEEB" />

        <path
          d="M32 34.5c1.5 1.5 4.5 1.5 6 0"
          stroke="#5C3D1E"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
