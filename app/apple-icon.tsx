import { ImageResponse } from "next/og";
import { BELLE_APP_ICON_BG, BELLE_APP_ICON_SVG } from "@/lib/icon-svgs";
import { renderAppIcon } from "@/lib/render-app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    renderAppIcon({
      svg: BELLE_APP_ICON_SVG,
      size: 180,
      backgroundColor: BELLE_APP_ICON_BG,
    }),
    { ...size },
  );
}
