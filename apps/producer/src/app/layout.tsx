import type { Metadata } from "next";
import { Archivo, Roboto_Mono } from "next/font/google";
import "./globals.css";

// Brand-aligned typography: Archivo (Neue Montreal / Helvetica Now web fallback)
// for headers, Roboto Mono for the technical/data voice — same stacks as the
// GROW hub and Grow Engine.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Growees Producer — Grow Recruitment Engine",
  description:
    "Deterministic internal recruitment tool with competency-based scoring, multi-rater scorecards, and automated pipeline management.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${robotoMono.variable}`}>
      <body className="min-h-screen">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-40 border-b border-[var(--color-border-subtle)]" style={{ background: "oklch(0.13 0.02 260 / 0.85)", backdropFilter: "blur(12px)" }}>
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              {/* GROW octagonal G mark */}
              <svg width="34" height="34" viewBox="0 0 100 100" fill="none" aria-label="GROW">
                <g stroke="#6366F1" strokeWidth="5.5" strokeLinecap="square">
                  <path d="M 31,5 H 69 L 95,31 V 42 M 95,66 V 69 L 69,95 H 31 L 5,69 V 31 Z" />
                  <path d="M 39,25 H 61 L 75,39 V 42 M 75,66 V 61 L 61,75 H 39 L 25,61 V 39 Z" />
                  <path d="M 97,46 H 50" /><path d="M 97,54 H 58" /><path d="M 97,62 H 66" />
                </g>
              </svg>
              <div>
                <h1 className="text-base font-semibold tracking-tight" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-inter)" }}>
                  Growees Producer
                </h1>
                <p className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-jetbrains)" }}>
                  GROW · Recruitment Engine
                </p>
              </div>
            </a>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm px-3 py-1.5 rounded-md transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Dashboard
              </a>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
