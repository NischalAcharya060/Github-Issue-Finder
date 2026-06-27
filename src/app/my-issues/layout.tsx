import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Issues — Issue Finder",
  description:
    "Track and manage your saved GitHub issues. Bookmark, organize, and mark issues as done to monitor your open-source contributions.",
  alternates: {
    canonical: "/my-issues",
  },
  openGraph: {
    title: "My Issues — Issue Finder",
    description:
      "Track and manage your saved GitHub issues. Bookmark, organize, and mark issues as done to monitor your open-source contributions.",
    url: "/my-issues",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Issues — Issue Finder",
    description: "Track and manage your saved GitHub issues.",
    images: [{ url: "/opengraph-image.png" }],
  },
}

export default function MyIssuesLayout({ children }: { children: React.ReactNode }) {
  return children
}
