"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas/auth"

interface Props {
  token: string
  email: string
}

export function ResetPasswordForm({ token, email }: Props) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  async function onSubmit(data: ResetPasswordInput) {
    try {
      await axios.post("/api/auth/reset-password", { token, email, password: data.password })
      router.push("/sign-in?toast=password-reset")
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>
      if (error.response?.status === 429) {
        toast.error(error.response.data?.error ?? "Too many attempts. Please try again later.")
      } else if (error.response?.data?.error === "token-expired") {
        toast.error("This reset link has expired.")
        router.push("/forgot-password?error=token-expired")
      } else {
        toast.error("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            New password
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
            Confirm new password
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting…" : "Reset password"}
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
