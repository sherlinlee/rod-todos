import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const site = getSiteConfig();

  return {
    name: site.appName,
    short_name: site.appName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: site.manifestBackground,
    theme_color: site.manifestBackground,
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
