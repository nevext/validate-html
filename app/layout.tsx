import type { Metadata } from "next";
import { kazerFluro, poppins } from "./fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "VALIDATE",
  description: "Uma plataforma para validação rápida de projetos por outras pessoas.",
  icons: {
    icon: [
      { url: "/img/icon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/img/icon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/img/icon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/img/icon/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${kazerFluro.variable} ${poppins.variable}`}>
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
