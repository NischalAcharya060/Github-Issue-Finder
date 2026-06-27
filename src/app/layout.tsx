import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";
import { Toaster } from "sonner";
import { JsonLd } from "@/components/shared/json-ld";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://issue-finder.acharyanischal.com.np"),
  title: "Issue Finder — Discover GitHub issues worth contributing to",
  description:
    "Search millions of GitHub issues and repositories with powerful filters. Find good-first-issues, help-wanted tasks, and hidden open-source opportunities.",
  applicationName: "Issue Finder",
  authors: [{ name: "Nischal Acharya", url: "http://acharyanischal.com.np" }],
  creator: "Nischal Acharya",
  publisher: "Nischal Acharya",
  keywords: [
    "github issues",
    "good first issue",
    "open source",
    "help wanted",
    "contribute",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Issue Finder — Discover GitHub issues worth contributing to",
    description:
      "Search millions of GitHub issues and repositories with powerful filters. Find good-first-issues, help-wanted tasks, and hidden open-source opportunities.",
    url: "https://issue-finder.acharyanischal.com.np",
    siteName: "Issue Finder",
    type: "website",
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Issue Finder — Discover GitHub issues worth contributing to",
    description:
      "Search millions of GitHub issues and repositories with powerful filters. Find good-first-issues, help-wanted tasks, and hidden open-source opportunities.",
    images: [{ url: "/opengraph-image.png" }],
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B82F6" },
    { media: "(prefers-color-scheme: dark)", color: "#0D1117" },
  ],
};

const themeScript = `
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    }
    const accent = localStorage.getItem("accent");
    if (accent) {
      document.documentElement.setAttribute("data-accent", accent);
    }
  } catch {} 
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="relative min-h-full flex flex-col">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Issue Finder",
            url: "https://issue-finder.acharyanischal.com.np",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "All",
            description:
              "Search millions of GitHub issues and repositories with powerful filters. Find good-first-issues, help-wanted tasks, and hidden open-source opportunities.",
            author: {
              "@type": "Person",
              name: "Nischal Acharya",
              url: "http://acharyanischal.com.np",
            },
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate:
                  "https://issue-finder.acharyanischal.com.np/?q={search_term_string}",
              },
              "query-input": "required name=search_term_string",
            },
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }}
        />
        <div
          aria-hidden
          className="bg-aurora pointer-events-none fixed inset-0 -z-10"
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:ring-2 focus:ring-primary"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <footer className="border-t border-border/40 bg-card/30 py-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
            <span>
              Built by{" "}
              <a
                href="http://acharyanischal.com.np"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground transition-colors"
              >
                Nischal Acharya
              </a>
            </span>
            <span>
              Indexing millions of open issues across every public GitHub
              repository
            </span>
            <span>
              Updated{" "}
              <time dateTime="2026-06-27">June 27, 2026</time>
            </span>
          </div>
        </footer>
        <ServiceWorkerRegister />
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
