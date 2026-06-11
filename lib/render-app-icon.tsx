import { svgToDataUri } from "@/lib/icon-svgs";

type RenderAppIconOptions = {
  svg: string;
  size: number;
  backgroundColor: string;
};

export function renderAppIcon({
  svg,
  size,
  backgroundColor,
}: RenderAppIconOptions) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        background: backgroundColor,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={svgToDataUri(svg)}
        alt=""
        width={size}
        height={size}
        style={{ display: "block", width: size, height: size }}
      />
    </div>
  );
}
