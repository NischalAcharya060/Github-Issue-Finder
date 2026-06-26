import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";
import { Toaster } from "sonner";

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
      "Search millions of GitHub issues and repositories with powerful filters.",
    url: "https://issue-finder.acharyanischal.com.np",
    siteName: "Issue Finder",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Issue Finder — Discover GitHub issues worth contributing to",
    description:
      "Search millions of GitHub issues and repositories with powerful filters.",
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
        <ServiceWorkerRegister />
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
