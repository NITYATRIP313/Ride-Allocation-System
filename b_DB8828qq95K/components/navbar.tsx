"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Car, Menu, X, LogOut, User, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem("userRole")
    const id = localStorage.getItem("userId")
    setUserRole(role)
    setUserId(id)
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    router.push("/")
  }

  // Don't show navbar on sign-in page
  if (pathname === "/") {
    return null
  }

  const navLinks = userRole === "driver" 
    ? [
        { href: "/driver", label: "Dashboard" },
        { href: "/history", label: "History" },
      ]
    : [
        { href: "/user", label: "Book Ride" },
        { href: "/history", label: "History" },
        { href: "/tracking", label: "Track Ride" },
      ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-lg">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={userRole === "driver" ? "/driver" : "/user"} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Car className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">RideFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                pathname === link.href 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {userId && (
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{userId}</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {userRole === "driver" ? "Driver" : "Rider"}
              </span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignOut}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-card md:hidden">
          <div className="container mx-auto flex flex-col gap-1 p-4">
            {userId && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{userId}</span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {userRole === "driver" ? "Driver" : "Rider"}
                </span>
              </div>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground ${
                  pathname === link.href 
                    ? "bg-muted text-foreground" 
                    : "text-muted-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
