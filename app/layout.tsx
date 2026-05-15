import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "@/lib/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "MagickVoice — Lead Management",
  description: "Multi-vendor customer lead management for MagickVoice",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
