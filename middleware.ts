import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip for API routes and setup page itself
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/setup") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  try {
    // Check if database is initialized
    const res = await fetch(new URL("/api/check-db", request.url))
    const data = await res.json()

    if (!data.initialized) {
      return NextResponse.redirect(new URL("/setup", request.url))
    }
  } catch (error) {
    console.error("Error checking database status:", error)
    // If we can't check, let the request through
    // The app will handle errors appropriately
  }

  return NextResponse.next()
}
