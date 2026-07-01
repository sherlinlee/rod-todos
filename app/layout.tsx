import type { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import SessionGuard from "@/components/SessionGuard";
import ThemeInit from "@/components/ThemeInit";
import ThemeToggle from "@/components/ThemeToggle";
import { getSiteConfig } from "@/lib/site";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const site = getSiteConfig();

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon-512.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: site.appName,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: site.themeColor,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-site={site.owner}
      className={`${fredoka.variable} h-full overflow-hidden antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k="${site.owner}-theme-mode",t=localStorage.getItem(k);if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t;return}if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.dataset.theme="dark"}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="fixed inset-0 flex flex-col overflow-hidden overscroll-none">
        <ThemeInit />
        <ThemeToggle />
        <SessionGuard />
        <div className="app-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
