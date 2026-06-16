import Link from "next/link"
import { MailCheck } from "lucide-react"
import { ResendVerificationButton } from "@/components/auth/ResendVerificationButton"

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-arcane/10 border border-arcane/20 p-4">
          <MailCheck className="size-8 text-arcane" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Check your inbox
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We sent a verification link to{" "}
          {email ? (
            <span className="font-medium text-foreground">{email}</span>
          ) : (
            "your email address"
          )}
          . Click the link to activate your account.
        </p>
        <p className="text-xs text-muted-foreground">
          The link expires in 15 minutes.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-3 text-left">
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or request a new
          link below.
        </p>
        <div className="flex justify-center pt-1">
          {email ? (
            <ResendVerificationButton email={email} />
          ) : (
            <Link href="/register" className="text-xs text-primary hover:underline">
              Register again
            </Link>
          )}
        </div>
      </div>

      <Link
        href="/sign-in"
        className="inline-flex items-center justify-center w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Back to sign in
      </Link>
    </div>
  )
}
