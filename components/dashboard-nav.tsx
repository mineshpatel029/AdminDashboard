"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Users, FileSpreadsheet, Menu, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { logout } from "@/lib/actions/auth-actions"
import { useToast } from "@/components/ui/use-toast"

export function DashboardNav({ user }: { user: any }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  async function handleLogout() {
    await logout()
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    })
    router.push("/login")
    router.refresh()
  }

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    },
    {
      href: "/dashboard/agents",
      label: "Agents",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      href: "/dashboard/lists",
      label: "Lists",
      icon: <FileSpreadsheet className="mr-2 h-5 w-5" />,
    },
  ]

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "AD"
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user?.name || "Admin Dashboard")}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">Admin Dashboard</span>
                </div>
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}
                  <Button
                    variant="ghost"
                    className="mt-4 justify-start px-3 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <Avatar className="h-8 w-8 md:h-6 md:w-6">
              <AvatarFallback>{getInitials(user?.name || "Admin Dashboard")}</AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block">Admin Dashboard</span>
          </Link>
          <nav className="hidden md:flex">
            <ul className="flex items-center gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(user?.name || "Admin")}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name || "Admin"}</span>
              {/* Removed the email display */}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

