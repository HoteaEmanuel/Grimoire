"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/schemas/auth"

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    try {
      await axios.post("/api/auth/forgot-password", data)
      setSent(true)
    } catch {
      toast.error("Something went wrong. Please try again.")
    }
  }

  if (sent) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
        <p className="text-sm text-muted-foreground leading-relaxed">
          If that email is registered, you&apos;ll receive a reset link shortly.
          Check your inbox (and spam folder).
        </p>
        <p className="text-xs text-muted-foreground">The link expires in 15 minutes.</p>
        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center w-full text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        <Link href="/sign-in" className="text-primary hover:underline font-medium">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
