"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, Eye, EyeOff, LogIn, User, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"

type UserRole = "rider" | "driver"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [role, setRole] = useState<UserRole>("rider")
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!userId.trim() || !password.trim()) {
      toast({ title: "Missing Fields", description: "Please enter your User ID and password.", variant: "destructive" })
      return
    }

    const parsedId = parseInt(userId, 10)
    if (isNaN(parsedId)) {
      toast({ title: "Invalid User ID", description: "User ID must be a number.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("USER")
        .select("user_id, name, user_type, password")
        .eq("user_id", parsedId)
        .eq("user_type", role === "rider" ? "rider" : "driver")
        .single()

      if (error || !data) {
        toast({ title: "User Not Found", description: `No ${role} account found with ID ${parsedId}.`, variant: "destructive" })
        setIsLoading(false)
        return
      }

      if (data.password !== password) {
        toast({ title: "Incorrect Password", description: "The password you entered is wrong. Please try again.", variant: "destructive" })
        setIsLoading(false)
        return
      }

      localStorage.setItem("userId", String(data.user_id))
      localStorage.setItem("userName", data.name)
      localStorage.setItem("userRole", data.user_type)

      toast({ title: `Welcome, ${data.name}!`, description: `Signed in as ${role}.` })

      if (data.user_type === "driver") {
        router.push("/driver")
      } else {
        router.push("/user")
      }
    } catch {
      toast({ title: "Login Failed", description: "Something went wrong. Please try again.", variant: "destructive" })
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Toaster />
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Car className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">RideFlow</h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue to your dashboard</p>
        </div>

        <Card className="border-border bg-card shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>Select your role and enter your credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">I am a</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("rider")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                    role === "rider"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Rider
                </button>
                <button
                  type="button"
                  onClick={() => setRole("driver")}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                    role === "driver"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  <Car className="h-4 w-4" />
                  Driver
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId" className="text-sm font-medium">User ID</Label>
              <Input
                id="userId"
                type="number"
                placeholder={role === "rider" ? "e.g. 1" : "e.g. 13"}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="h-12"
                min={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </span>
              )}
            </Button>

            <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
              <div className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                <Shield className="h-3.5 w-3.5" />
                Demo Credentials
              </div>
              <div className="space-y-1">
                <p><span className="font-medium text-foreground">Rider</span> — ID: 1, pw: <span className="font-mono">harshit123</span></p>
                <p><span className="font-medium text-foreground">Driver</span> — ID: 13, pw: <span className="font-mono">nitya123</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
