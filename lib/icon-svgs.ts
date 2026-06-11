/** Homescreen icon art — 512×512 viewBox, ~10% safe padding for iOS mask. */

export const ROD_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="rodSky" x1="256" y1="48" x2="256" y2="464" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f5fbff"/>
      <stop stop-color="#c9e4f7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#rodSky)"/>
  <circle cx="420" cy="108" r="28" fill="#FFD54F" opacity="0.55"/>
  <circle cx="92" cy="400" r="20" fill="#87CEEB" opacity="0.45"/>
  <g transform="translate(136 108) scale(5.2)">
    <circle cx="24" cy="27" r="14" fill="#F4C98D"/>
    <path d="M14 20c1-8 6-12 10-12s9 4 10 12" fill="#FFD54F"/>
    <path d="M16 14c2-5 5-8 8-8s6 3 8 8c-3 1-5 2-8 2s-5-1-8-2z" fill="#F5B800"/>
    <rect x="10" y="24" width="28" height="18" rx="6" fill="#FF7A1A"/>
    <path d="M10 30h28" stroke="#E85D04" stroke-width="1.5"/>
    <rect x="14" y="26" width="8" height="2" rx="1" fill="#FFB347" opacity="0.7"/>
    <path d="M15 22.5h18c2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5H15c-2 0-3.5-1.5-3.5-3.5s1.5-3.5 3.5-3.5z" fill="#1A1A2E"/>
    <rect x="16" y="24" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.85"/>
    <rect x="26" y="24" width="6" height="2.5" rx="1" fill="#87CEEB" opacity="0.85"/>
    <path d="M22 33.5c1.5 1.5 4 1.5 5.5 0" stroke="#5C3D1E" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M24 8c3 0 5 2 6 4" stroke="#F5B800" stroke-width="2" stroke-linecap="round"/>
  </g>
  <path d="M388 372l18 10-18 10v-20z" fill="#1a3352" opacity="0.85"/>
  <path d="M372 382h36" stroke="#FFD54F" stroke-width="6" stroke-linecap="round"/>
</svg>`;

export const BELLE_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bellePink" x1="256" y1="48" x2="256" y2="464" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fff5f8"/>
      <stop stop-color="#f8c8dc"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bellePink)"/>
  <g transform="translate(256 268)">
    <path d="M0-92c-34 0-62 28-62 62s28 62 62 62 62-28 62-62-28-62-62-62z" fill="#e63946"/>
    <ellipse cx="0" cy="8" rx="48" ry="54" fill="#ef476f"/>
    <path d="M-8-118c-6-18 8-32 22-28 8 14 16 22 8 28-10 6-22 4-30 0z" fill="#6bbf59"/>
    <path d="M8-118c6-18-8-32-22-28-8 14-16 22-8 28 10 6 22 4 30 0z" fill="#7ed957"/>
    <circle cx="-22" cy="-18" r="4" fill="#ffd166" opacity="0.9"/>
    <circle cx="6" cy="-32" r="4" fill="#ffd166" opacity="0.9"/>
    <circle cx="24" cy="-8" r="4" fill="#ffd166" opacity="0.9"/>
    <circle cx="-8" cy="12" r="4" fill="#ffd166" opacity="0.9"/>
    <circle cx="18" cy="22" r="4" fill="#ffd166" opacity="0.9"/>
    <circle cx="-28" cy="18" r="4" fill="#ffd166" opacity="0.9"/>
  </g>
  <g transform="translate(132 148)">
    <circle cx="0" cy="0" r="34" fill="#d62839"/>
    <rect x="-4" y="-48" width="8" height="18" rx="4" fill="#6bbf59"/>
    <path d="M0-48c8-6 16-4 18 4" stroke="#7ed957" stroke-width="5" stroke-linecap="round"/>
  </g>
  <g fill="#ff8fab">
    <circle cx="388" cy="132" r="16"/>
    <circle cx="404" cy="148" r="16"/>
    <circle cx="372" cy="148" r="16"/>
    <circle cx="388" cy="164" r="16"/>
    <circle cx="388" cy="148" r="9" fill="#ffd166"/>
  </g>
  <g fill="#ff8fab" transform="translate(108 360)">
    <circle cx="0" cy="0" r="14"/>
    <circle cx="16" cy="14" r="14"/>
    <circle cx="-16" cy="14" r="14"/>
    <circle cx="0" cy="24" r="14"/>
    <circle cx="0" cy="12" r="8" fill="#ffd166"/>
  </g>
  <g fill="#ff8fab" transform="translate(400 360)">
    <circle cx="0" cy="0" r="12"/>
    <circle cx="14" cy="12" r="12"/>
    <circle cx="-14" cy="12" r="12"/>
    <circle cx="0" cy="20" r="12"/>
    <circle cx="0" cy="10" r="6" fill="#ffd166"/>
  </g>
</svg>`;

export const SPARK_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="sparkWarm" x1="256" y1="48" x2="256" y2="464" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fff7ed"/>
      <stop stop-color="#fdba74"/>
    </linearGradient>
    <linearGradient id="globeBlue" x1="256" y1="120" x2="256" y2="380" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38bdf8"/>
      <stop stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#sparkWarm)"/>
  <circle cx="256" cy="248" r="148" fill="url(#globeBlue)"/>
  <ellipse cx="256" cy="248" rx="148" ry="148" fill="#0ea5e9" opacity="0.25"/>
  <path d="M188 196c42-28 96-18 118 24 22 42-8 96-54 108-46 12-92-24-98-68-6-44 32-78 34-64z" fill="#4ade80" opacity="0.85"/>
  <path d="M292 320c34 18 78 8 92-22 14-30-6-68-44-78-38-10-72 18-80 52-8 34 8 30 32 48z" fill="#86efac" opacity="0.8"/>
  <path d="M210 290c-18 34-8 74 24 88 32 14 72-4 84-36 12-32-12-66-46-74-34-8-62 12-62 22z" fill="#22c55e" opacity="0.75"/>
  <ellipse cx="256" cy="248" rx="148" ry="148" stroke="#0369a1" stroke-width="6"/>
  <g transform="translate(256 318)">
    <ellipse cx="0" cy="52" rx="72" ry="58" fill="#fb923c"/>
    <circle cx="0" cy="-18" r="52" fill="#fcd9b6"/>
    <path d="M-52-10c8-36 36-52 52-52s44 16 52 52c-16 8-34 12-52 12s-36-4-52-12z" fill="#5c3d1e"/>
    <circle cx="-18" cy="-22" r="6" fill="#1e293b"/>
    <circle cx="18" cy="-22" r="6" fill="#1e293b"/>
    <path d="M-12 2c10 10 22 10 32 0" stroke="#c2410c" stroke-width="4" stroke-linecap="round"/>
    <path d="M-58 8c-10 24-6 48 8 62" stroke="#fcd9b6" stroke-width="14" stroke-linecap="round"/>
    <path d="M58 8c10 24 6 48-8 62" stroke="#fcd9b6" stroke-width="14" stroke-linecap="round"/>
  </g>
  <path d="M392 120l14 24-28 4 20 16-24-12-4 28-8-26-26 8 18-20-24-6 26-2z" fill="#fbbf24"/>
</svg>`;

export function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
