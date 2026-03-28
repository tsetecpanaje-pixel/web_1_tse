import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taller Línea 5 - SGT",
  description: "Sistema de Gestión de Trenes - Taller Línea 5",
  manifest: "/manifest.json",
  icons: {
    icon: "/SGT_01.png",
    shortcut: "/SGT_01.png",
    apple: "/SGT_01.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased selection:bg-primary/30 selection:text-primary-foreground`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
