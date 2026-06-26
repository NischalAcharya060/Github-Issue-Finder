import { NextResponse } from "next/server"

export function middleware() {
  const response = NextResponse.next()

  // Security headers for all responses
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )

  // CSP — allow inline scripts (needed for theme hydration script)
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://avatars.githubusercontent.com",
      "font-src 'self' data:",
      "connect-src 'self' https://api.github.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  )

  return response
}

export const config = {
  matcher: [
    // Apply to all routes except static files, _next, and API internal
    "/((?!_next/static|_next/image|favicon|api/auth).*)",
  ],
}
