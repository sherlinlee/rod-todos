/** Homescreen icon art — full-bleed 512×512, artwork centered large. */

const ROD_AVATAR = `<g>
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
</g>`;

const BELLE_BEAR_AVATAR = `<g>
  <circle cx="24" cy="26" r="16" fill="#FFE4EC"/>
  <ellipse cx="24" cy="30" rx="11" ry="9" fill="#FFD6E5"/>
  <path d="M12 18c2-6 8-10 12-10s10 4 12 10" fill="#6B4F5A"/>
  <circle cx="14" cy="20" r="5" fill="#6B4F5A"/>
  <circle cx="34" cy="20" r="5" fill="#6B4F5A"/>
  <path d="M18 12c0-4 2.5-7 6-7s6 3 6 7" fill="#6B4F5A"/>
  <path d="M30 10c3-1 6 1 7 4-2 1-4 0-5-2" fill="#FF8FAB"/>
  <circle cx="18" cy="27" r="2" fill="#4A3F55"/>
  <circle cx="30" cy="27" r="2" fill="#4A3F55"/>
  <circle cx="19" cy="26.5" r="0.6" fill="white"/>
  <circle cx="31" cy="26.5" r="0.6" fill="white"/>
  <ellipse cx="14" cy="31" rx="2.5" ry="1.5" fill="#FF8FAB" opacity="0.55"/>
  <ellipse cx="34" cy="31" rx="2.5" ry="1.5" fill="#FF8FAB" opacity="0.55"/>
  <path d="M20 33.5c2 2.5 6 2.5 8 0" stroke="#4A3F55" stroke-width="1.5" stroke-linecap="round"/>
</g>`;

const STRAWBERRY = `<g>
  <path d="M0-92c-34 0-62 28-62 62s28 62 62 62 62-28 62-62-28-62-62-62z" fill="#e63946"/>
  <ellipse cx="0" cy="8" rx="48" ry="54" fill="#ef476f"/>
  <path d="M-8-118c-6-18 8-32 22-28 8 14 16 22 8 28-10 6-22 4-30 0z" fill="#6bbf59"/>
  <path d="M8-118c6-18-8-32-22-28-8 14-16 22-8 28 10 6 22 4 30 0z" fill="#7ed957"/>
  <circle cx="-22" cy="-18" r="4" fill="#ffd166"/>
  <circle cx="6" cy="-32" r="4" fill="#ffd166"/>
  <circle cx="24" cy="-8" r="4" fill="#ffd166"/>
  <circle cx="-8" cy="12" r="4" fill="#ffd166"/>
  <circle cx="18" cy="22" r="4" fill="#ffd166"/>
  <circle cx="-28" cy="18" r="4" fill="#ffd166"/>
</g>`;

export const ROD_APP_ICON_BG = "#b8dcf0";
export const BELLE_APP_ICON_BG = "#f5a0bd";
export const ROD_HOMESCREEN_ICON_BG = "#b8dcf0";
export const SPARK_APP_ICON_BG = "#fdba74";
export const REFLECTION_APP_ICON_BG = "#f7f4ef";
export const COUPLE_APP_ICON_BG = "#bce4f6";

export const ROD_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="rodSky" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#c9e4f7"/>
      <stop stop-color="#8ec8ef"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#rodSky)"/>
  <g transform="translate(256 292) scale(7.4) translate(-24 -24)">${ROD_AVATAR}</g>
  <path d="M372 404l16 9-16 9v-18z" fill="#1a3352" opacity="0.9"/>
  <path d="M358 413h32" stroke="#FFD54F" stroke-width="5" stroke-linecap="round"/>
</svg>`;

export const BELLE_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bellePink" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f8c8dc"/>
      <stop stop-color="#f5a0bd"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bellePink)"/>
  <g transform="translate(256 300) scale(2.55)">${STRAWBERRY}</g>
  <g transform="translate(256 252) scale(5.6) translate(-24 -24)">${BELLE_BEAR_AVATAR}</g>
  <g transform="translate(138 148) scale(1.45)">
    <circle cx="0" cy="0" r="34" fill="#d62839"/>
    <rect x="-4" y="-48" width="8" height="18" rx="4" fill="#6bbf59"/>
    <path d="M0-48c8-6 16-4 18 4" stroke="#7ed957" stroke-width="5" stroke-linecap="round"/>
  </g>
  <g fill="#ff8fab" transform="translate(392 118) scale(1.15)">
    <circle cx="0" cy="0" r="16"/><circle cx="16" cy="14" r="16"/><circle cx="-16" cy="14" r="16"/><circle cx="0" cy="24" r="16"/>
    <circle cx="0" cy="12" r="9" fill="#ffd166"/>
  </g>
</svg>`;

/** Rod PWA — strawberry person on pastel blue (same art as Belle icon, Rod sky). */
export const ROD_HOMESCREEN_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="rodHomescreenBlue" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#d4eaf8"/>
      <stop stop-color="#b8dcf0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#rodHomescreenBlue)"/>
  <g transform="translate(256 300) scale(2.55)">${STRAWBERRY}</g>
  <g transform="translate(256 252) scale(5.6) translate(-24 -24)">${BELLE_BEAR_AVATAR}</g>
  <g transform="translate(138 148) scale(1.45)">
    <circle cx="0" cy="0" r="34" fill="#d62839"/>
    <rect x="-4" y="-48" width="8" height="18" rx="4" fill="#6bbf59"/>
    <path d="M0-48c8-6 16-4 18 4" stroke="#7ed957" stroke-width="5" stroke-linecap="round"/>
  </g>
  <g fill="#ff8fab" transform="translate(392 118) scale(1.15)">
    <circle cx="0" cy="0" r="16"/><circle cx="16" cy="14" r="16"/><circle cx="-16" cy="14" r="16"/><circle cx="0" cy="24" r="16"/>
    <circle cx="0" cy="12" r="9" fill="#ffd166"/>
  </g>
</svg>`;

export const COUPLE_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="coupleSky" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#bce4f6"/>
      <stop stop-color="#fff3e6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#coupleSky)"/>
  <g transform="translate(178 292) scale(6.2) translate(-24 -24)">${ROD_AVATAR}</g>
  <g transform="translate(334 292) scale(6.2) translate(-24 -24)">${BELLE_BEAR_AVATAR}</g>
  <path d="M256 118c-8 10-22 10-30 0 8-6 22-6 30 0z" fill="#f07fa1"/>
  <circle cx="256" cy="108" r="10" fill="#ffd166" opacity="0.85"/>
</svg>`;

export const SPARK_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="sparkWarm" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#fff7ed"/>
      <stop stop-color="#fdba74"/>
    </linearGradient>
    <linearGradient id="globeBlue" x1="256" y1="96" x2="256" y2="416" gradientUnits="userSpaceOnUse">
      <stop stop-color="#5dd9a4"/>
      <stop stop-color="#1a4a3a"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#sparkWarm)"/>
  <circle cx="256" cy="248" r="168" fill="url(#globeBlue)"/>
  <path d="M188 196c42-28 96-18 118 24 22 42-8 96-54 108-46 12-92-24-98-68-6-44 32-78 34-64z" fill="#86efac" opacity="0.85"/>
  <path d="M292 320c34 18 78 8 92-22 14-30-6-68-44-78-38-10-72 18-80 52-8 34 8 30 32 48z" fill="#bbf7d0" opacity="0.8"/>
  <ellipse cx="256" cy="248" rx="168" ry="168" stroke="#0f3028" stroke-width="6"/>
  <g transform="translate(256 322) scale(1.15)">
    <ellipse cx="0" cy="48" rx="64" ry="52" fill="#1a4a3a"/>
    <circle cx="0" cy="-16" r="46" fill="#fcd9b6"/>
    <path d="M-46-8c6-32 30-46 46-46s40 14 46 46c-14 8-30 12-46 12s-32-4-46-12z" fill="#5c3d1e"/>
    <circle cx="-16" cy="-20" r="5" fill="#142e24"/>
    <circle cx="16" cy="-20" r="5" fill="#142e24"/>
    <path d="M-10 4c8 8 18 8 26 0" stroke="#c2410c" stroke-width="4" stroke-linecap="round"/>
    <path d="M-52 6c-8 20-4 42 6 54" stroke="#fcd9b6" stroke-width="12" stroke-linecap="round"/>
    <path d="M52 6c8 20 4 42-6 54" stroke="#fcd9b6" stroke-width="12" stroke-linecap="round"/>
  </g>
  <path d="M392 96l12 20-24 4 18 14-20-10-4 24-6-22-22 6 16-18-22-4 24-2z" fill="#e6a817"/>
</svg>`;

export const REFLECTION_APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="reflectWarm" x1="256" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse">
      <stop stop-color="#faf4e6"/>
      <stop stop-color="#f7f4ef"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#reflectWarm)"/>
  <g transform="translate(256 292) scale(1.35)">
    <path d="M-92-58c0-18 14-32 32-32h120c18 0 32 14 32 32v92c0 18-14 32-32 32H-60c-18 0-32-14-32-32v-92z" fill="#fff"/>
    <path d="M-92-58c0-18 14-32 32-32h58v156H-60c-18 0-32-14-32-32v-92z" fill="#faf4e6"/>
    <path d="M-28-90h116c12 0 22 10 22 22v8H-50v-30z" fill="#9a7c2e"/>
    <path d="M-16-18h72M-16 2h56M-16 22h40" stroke="#c8a85a" stroke-width="6" stroke-linecap="round"/>
    <path d="M52-18h36M52 2h28M52 22h20" stroke="#d9c78a" stroke-width="6" stroke-linecap="round"/>
    <circle cx="88" cy="36" r="34" fill="#EAF5F3" stroke="#1A7A6E" stroke-width="8"/>
    <circle cx="88" cy="36" r="16" fill="#fff" stroke="#1A7A6E" stroke-width="6"/>
    <path d="M114 62l34 34" stroke="#1A7A6E" stroke-width="10" stroke-linecap="round"/>
    <path d="M142 90l12 12" stroke="#9a7c2e" stroke-width="12" stroke-linecap="round"/>
  </g>
</svg>`;

export function svgToDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
