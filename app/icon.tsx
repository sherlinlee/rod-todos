import { ImageResponse } from "next/og";
import { BELLE_APP_ICON_BG, BELLE_APP_ICON_SVG } from "@/lib/icon-svgs";
import { renderAppIcon } from "@/lib/render-app-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    renderAppIcon({
      svg: BELLE_APP_ICON_SVG,
      size: 512,
      backgroundColor: BELLE_APP_ICON_BG,
    }),
    { ...size },
  );
}
