import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Issue Finder — Discover GitHub issues worth contributing to",
  description:
    "Search millions of GitHub issues and repositories with powerful filters. Find good-first-issues, help-wanted tasks, and hidden open-source opportunities.",
  keywords: [
    "github issues",
    "good first issue",
    "open source",
    "help wanted",
    "contribute",
  ],
  openGraph: {
    title: "Issue Finder — Discover GitHub issues worth contributing to",
    description:
      "Search millions of GitHub issues and repositories with powerful filters.",
    type: "website",
  },
};

const themeScript = `
  try {
    const theme = localStorage.getItem("theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
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
      </body>
    </html>
  );
}
