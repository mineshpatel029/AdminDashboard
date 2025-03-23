import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./lib/auth"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define paths that are protected
  const isProtectedPath = path.startsWith("/dashboard")

  // Define paths that are public
  const isPublicPath = path === "/login"

  const token = request.cookies.get("auth-token")?.value

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token) {
    const payload = await verifyJWT(token)

    // If the token is invalid, redirect to login
    if (!payload && isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // If the user is logged in and trying to access login page, redirect to dashboard
    if (payload && isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}

