import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Repos — Issue Finder",
  description:
    "Browse and manage your saved GitHub repositories. Quickly access repos you care about and explore their open issues.",
  keywords: [
    "saved github repositories",
    "repo bookmarking",
    "open source repos",
    "favorite repositories",
    "github repo organizer",
  ],
  alternates: {
    canonical: "/my-repos",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "My Repos — Issue Finder",
    description:
      "Browse and manage your saved GitHub repositories. Quickly access repos you care about and explore their open issues.",
    url: "/my-repos",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Repos — Issue Finder",
    description: "Browse and manage your saved GitHub repositories.",
    images: [{ url: "/opengraph-image" }],
  },
}

export default function MyReposLayout({ children }: { children: React.ReactNode }) {
  return children
}
