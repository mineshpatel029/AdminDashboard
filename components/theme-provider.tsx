"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force client-side rendering for theme provider to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Only render the children when mounted on the client
  // This prevents hydration mismatch between server and client
  if (!mounted) {
    // Return a placeholder with the same structure but without theme-specific classes
    return <div style={{ visibility: "hidden" }}>{children}</div>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

