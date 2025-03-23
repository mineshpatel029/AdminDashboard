import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"

export default async function Home() {
  // Check if the user is logged in by verifying the JWT token
  const user = await getCurrentUser()

  // If user is logged in (valid JWT token exists), redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }
  // If user is not logged in (no valid JWT token), redirect to login page
  else {
    redirect("/login")
  }

  // This return statement will never be reached due to the redirects
  return null
}

