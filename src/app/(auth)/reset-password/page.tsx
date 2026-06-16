import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm"

interface Props {
  searchParams: Promise<{ token?: string; email?: string }>
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token, email } = await searchParams

  if (!token || !email) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Invalid reset link
          </h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing required parameters.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full text-sm text-primary hover:underline font-medium"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Reset password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <ResetPasswordForm token={token} email={email} />
    </div>
  )
}
