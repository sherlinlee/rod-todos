import { ImageResponse } from "next/og";
import { ROD_HOMESCREEN_ICON_BG, ROD_HOMESCREEN_ICON_SVG } from "@/lib/icon-svgs";
import { renderAppIcon } from "@/lib/render-app-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    renderAppIcon({
      svg: ROD_HOMESCREEN_ICON_SVG,
      size: 512,
      backgroundColor: ROD_HOMESCREEN_ICON_BG,
    }),
    { ...size },
  );
}
