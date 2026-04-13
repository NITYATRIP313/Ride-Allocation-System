"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Car, Eye, EyeOff, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { supabase } from "@/lib/supabase"

export default function SignInPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"rider" | "driver">("rider")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId.trim() || !password.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both User ID and Password.",
        variant: "destructive",
      })
      return
    }

    const parsedId = parseInt(userId.trim())
    if (isNaN(parsedId)) {
      toast({
        title: "Invalid User ID",
        description: "User ID must be a number.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Query the USER table in Supabase
      const { data, error } = await supabase
        .from("USER")
        .select("user_id, name, user_type, password")
        .eq("user_id", parsedId)
        .single()

      if (error || !data) {
        toast({
          title: "User Not Found",
          description: "No account found with that User ID.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check password
      if (data.password !== password.trim()) {
        toast({
          title: "Wrong Password",
          description: "The password you entered is incorrect.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Check role matches what user selected
      if (data.user_type !== role) {
        toast({
          title: "Wrong Role Selected",
          description: `This account is registered as a ${data.user_type === "rider" ? "Rider" : "Driver"}. Please select the correct role.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Success — store session info
      localStorage.setItem("userRole", data.user_type)
      localStorage.setItem("userId", String(data.user_id))
      localStorage.setItem("userName", data.name)

      toast({
        title: `Welcome, ${data.name}!`,
        description: `Signed in successfully as ${data.user_type === "rider" ? "Rider" : "Driver"}.`,
      })

      // Redirect based on role
      if (data.user_type === "rider") {
        router.push("/user")
      } else {
        // Get driver_id for drivers and store it
        const { data: driverData } = await supabase
          .from("DRIVER")
          .select("driver_id")
          .eq("user_id", data.user_id)
          .single()

        if (driverData) {
          localStorage.setItem("driverId", String(driverData.driver_id))
        }
        router.push("/driver")
      }
    } catch {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <Toaster />
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-[500px] w-[500px] animate-pulse rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] animate-pulse rounded-full bg-primary/10 blur-3xl" style={{ animationDelay: '1s' }} />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] animate-pulse rounded-full bg-secondary/10 blur-3xl" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/30 transition-transform hover:scale-105">
            <Car className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent">RideFlow</h1>
          <p className="mt-2 text-muted-foreground">Your trusted ride-sharing partner</p>
        </div>

        {/* Sign In Card */}
        <Card className="border-border bg-card/80 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign In</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-6">
              {/* User ID */}
              <div className="space-y-2">
                <Label htmlFor="userId" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-primary" />
                  User ID
                </Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter your User ID (e.g. 1)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4 text-primary" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">I am a</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) => setRole(value as "rider" | "driver")}
                  className="grid grid-cols-2 gap-4"
                  disabled={isLoading}
                >
                  <Label
                    htmlFor="rider"
                    className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${
                      role === "rider"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="rider" id="rider" className="sr-only" />
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      role === "rider" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <User className={`h-6 w-6 ${role === "rider" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className={`font-medium ${role === "rider" ? "text-primary" : "text-foreground"}`}>
                      Rider
                    </span>
                  </Label>

                  <Label
                    htmlFor="driver"
                    className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${
                      role === "driver"
                        ? "border-secondary bg-secondary/10"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem value="driver" id="driver" className="sr-only" />
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      role === "driver" ? "bg-secondary/30" : "bg-muted"
                    }`}>
                      <Car className={`h-6 w-6 ${role === "driver" ? "text-secondary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <span className={`font-medium ${role === "driver" ? "text-secondary-foreground" : "text-foreground"}`}>
                      Driver
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Demo hint */}
              <p className="text-center text-xs text-muted-foreground">
                Demo riders: ID 1–12 · Demo drivers: ID 13–20
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
