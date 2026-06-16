"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { signInSchema, type SignInInput } from "@/lib/schemas/auth"

export function SignInForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  async function onSubmit(data: SignInInput) {
    setServerError(null)

    // Rate limit check — stops before calling signIn() so it never throws on 429
    try {
      await axios.post("/api/auth/signin-check", { email: data.email })
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 429) {
        const msg = err.response.data?.error ?? "Too many sign-in attempts. Please try again later."
        toast.error(msg)
        setServerError(msg)
        return
      }
      // Non-429 errors from the check endpoint are non-fatal — proceed with sign-in
    }

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (res?.error) {
        setServerError("Invalid email or password")
        return
      }

      toast.success("Signed in successfully")
      router.push("/dashboard")
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  async function handleGitHub() {
    await signIn("github", { redirectTo: "/dashboard?toast=signin" })
  }

  async function handleResend() {
    const email = getValues("email")
    if (!email) {
      toast.error("Enter your email address above first.")
      return
    }

    setResendLoading(true)
    try {
      await axios.post("/api/auth/resend-verification", { email })
      toast.success("Verification email sent! Check your inbox.")
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)

      // Start cooldown
      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) { clearInterval(interval); return 0 }
          return c - 1
        })
      }, 1000)
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 429) {
        toast.error(err.response.data?.error ?? "Too many attempts. Please try again later.")
        return
      }
      toast.error("Failed to send email. Please try again.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-8 space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive text-center">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={handleGitHub}>
        <svg className="mr-2 size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
        Sign in with GitHub
      </Button>

      <div className="space-y-2 text-center text-sm text-muted-foreground">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Register
          </Link>
        </p>
        <p>
          Email not verified?{" "}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground/60 tabular-nums">
              Resend in {resendCooldown}s
            </span>
          ) : (
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={resendLoading}
              className="h-auto p-0 font-medium"
            >
              {resendLoading ? "Sending…" : "Resend verification"}
            </Button>
          )}
        </p>
      </div>
    </div>
  )
}
