import { ImageResponse } from "next/og"

export const alt = "Issue Finder — Discover GitHub issues worth contributing to"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0c1512 0%, #0d1117 50%, #0f1a1f 100%)",
          fontFamily: "Inter, sans-serif",
          padding: "60px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30%",
            right: "-15%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-20%",
            left: "-10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="6" y1="3" x2="6" y2="15" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </svg>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "#e6f5ee",
              letterSpacing: "-0.02em",
            }}
          >
            Issue Finder
          </span>
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            margin: 0,
            marginBottom: "16px",
            maxWidth: "800px",
          }}
        >
          Discover GitHub issues worth contributing to
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#9bbdb0",
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "650px",
          }}
        >
          Search millions of issues with powerful filters — good-first-issues,
          help-wanted, and hidden open-source opportunities
        </p>
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              color: "#6b8a7a",
              background: "rgba(16,185,129,0.1)",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            nextjs · typescript · tailwind
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "#6b8a7a",
              background: "rgba(56,189,248,0.1)",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid rgba(56,189,248,0.2)",
            }}
          >
            open source
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
