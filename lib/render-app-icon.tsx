import { svgToDataUri } from "@/lib/icon-svgs";

type RenderAppIconOptions = {
  svg: string;
  size: number;
};

export function renderAppIcon({ svg, size }: RenderAppIconOptions) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={svgToDataUri(svg)}
        alt=""
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    </div>
  );
}
