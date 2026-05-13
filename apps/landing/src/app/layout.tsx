import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Antigravity Runtime — Autonomous Local Execution Platform",
  description:
    "Deterministic orchestration. Replayable execution. Self-healing infrastructure. The production-grade autonomous execution runtime.",
  keywords: [
    "autonomous execution",
    "runtime platform",
    "deterministic orchestration",
    "self-healing infrastructure",
    "execution replay",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          "min-h-screen font-sans antialiased bg-runtime-bg",
          inter.variable,
          mono.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
