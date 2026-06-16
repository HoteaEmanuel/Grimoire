"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { registerSchema, type RegisterInput } from "@/lib/schemas/auth"

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterInput) {
    setServerError(null)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json()
      setServerError(body.error ?? "Something went wrong")
      return
    }

    toast.success("Account created! Please sign in.")
    router.push("/sign-in")
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
            Confirm password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive text-center">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  )
}
