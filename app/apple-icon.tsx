import { ImageResponse } from "next/og";
import { ROD_APP_ICON_BG, ROD_APP_ICON_SVG } from "@/lib/icon-svgs";
import { renderAppIcon } from "@/lib/render-app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    renderAppIcon({
      svg: ROD_APP_ICON_SVG,
      size: 180,
      backgroundColor: ROD_APP_ICON_BG,
    }),
    { ...size },
  );
}
