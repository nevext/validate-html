import localFont from "next/font/local";
import { Poppins } from "next/font/google";

export const kazerFluro = localFont({
  src: [
    { path: "./fonts/kazer-studio-fluro-light.otf", weight: "300", style: "normal" },
    { path: "./fonts/kazer-studio-fluro.otf", weight: "400", style: "normal" },
    { path: "./fonts/kazer-studio-fluro-semibold.otf", weight: "600", style: "normal" },
    { path: "./fonts/kazer-studio-fluro-bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-kazer-fluro",
  display: "swap",
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
