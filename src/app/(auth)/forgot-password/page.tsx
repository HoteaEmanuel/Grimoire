import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm"

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Forgot password?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error === "token-expired" && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive text-center">
          That reset link has expired. Request a new one below.
        </div>
      )}

      <ForgotPasswordForm />
    </div>
  )
}
