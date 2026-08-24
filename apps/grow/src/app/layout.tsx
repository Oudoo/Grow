import type { Metadata } from "next";
import { Archivo, Roboto_Mono, Cairo } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { prisma } from "@/lib/db";
import { LanguageProvider } from "@/components/LanguageContext";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { ecosystem as fallbackEcosystem } from "@/data/ecosystem";
import type { EcosystemSuite } from "@/lib/types";
import "./globals.css";

// Headers: Neue Montreal / Helvetica Now load locally when installed;
// Archivo is the licensed web fallback in the same grotesque family.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

// Space/Data: Roboto Mono — the technical SaaS data voice.
const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://grow.agency";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GROW — Integrated Marketing & Enterprise Infrastructure",
    template: "%s | GROW",
  },
  description:
    "GROW is the marketing agency built on infrastructure. Integrated creative and enterprise systems operating as one — strategy, performance, content, and predictive modeling at scale.",
  keywords: [
    "marketing agency",
    "growth marketing",
    "performance marketing",
    "brand strategy",
    "growth intelligence",
    "business solutions",
    "marketing infrastructure",
    "predictive modeling",
  ],
  applicationName: "GROW",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "GROW",
    title: "GROW — Integrated Marketing & Enterprise Infrastructure",
    description: "Integrated Creative & Enterprise Infrastructure Operating as One.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "GROW — Integrated Marketing & Enterprise Infrastructure",
    description: "Integrated Creative & Enterprise Infrastructure Operating as One.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The navbar mega-menu needs the ecosystem, but a DB hiccup must never take
  // down the entire site (this layout wraps every page, including static ones).
  // Fall back to the bundled ecosystem data so navigation still renders.
  //
  // The fallback alone is not enough: without a deadline, a database that is
  // reachable-but-slow (or a saturated connection pool on shared hosting) makes
  // the driver wait out its own ~30s timeout on EVERY dynamically rendered page
  // before this catch runs. Measured 31.5s on / and /admin/login in production.
  // Race the query against a short deadline so a slow DB costs ~1.5s, not 30.
  let ecosystemData: EcosystemSuite[] = fallbackEcosystem;
  try {
    ecosystemData = await Promise.race([
      prisma.suite.findMany({ include: { products: true } }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("ecosystem query timed out")), 1500)
      ),
    ]);
  } catch (e) {
    console.error("Layout: failed to load ecosystem from DB, using static fallback:", e);
  }

  return (
    <html
      lang="en"
      className={`${archivo.variable} ${robotoMono.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="font-body bg-void text-platinum antialiased min-h-screen flex flex-col transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider initialEcosystem={ecosystemData}>
            <Navbar />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <ExitIntentPopup />
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
