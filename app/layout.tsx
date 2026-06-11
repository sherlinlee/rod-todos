import type { Metadata, Viewport } from "next";
import { Bangers, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const bangers = Bangers({
  variable: "--font-bangers",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "rod's to-do(s) ⚡",
  description: "A bold little to-do app, just for Rod",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "rod's to-do(s)",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eaf4fc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${bangers.variable} h-full antialiased`}
    >
      <body className="min-h-dvh overflow-x-hidden flex flex-col">
        {children}
      </body>
    </html>
  );
}
