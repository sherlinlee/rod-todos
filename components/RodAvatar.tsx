export default function RodAvatar({ size = 36 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 align-middle"
      role="img"
      aria-label="Rod"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-rod-bob drop-shadow-sm"
      >
        <circle cx="24" cy="27" r="14" fill="#F4C98D" />
        <path
          d="M14 20c1-8 6-12 10-12s9 4 10 12"
          fill="#FFD54F"
        />
        <path
          d="M16 14c2-5 5-8 8-8s6 3 8 8c-3 1-5 2-8 2s-5-1-8-2z"
          fill="#F5B800"
        />
        <rect x="10" y="24" width="28" height="18" rx="6" fill="#FF7A1A" />
        <path d="M10 30h28" stroke="#E85D04" strokeWidth="1.5" />
        <rect x="14" y="26" width="8" height="2" rx="1" fill="#FFB347" opacity="0.7" />
        <path
          d="M15 22.5h18c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5H15c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5z"
          fill="#1A1A2E"
        />
        <rect x="16" y="24" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.85" />
        <rect x="26" y="24" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.85" />
        <path
          d="M22 33.5c1.5 1.5 4 1.5 5.5 0"
          stroke="#5C3D1E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M24 8c3 0 5 2 6 4"
          stroke="#F5B800"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
