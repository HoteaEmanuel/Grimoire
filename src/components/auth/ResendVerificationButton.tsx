"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

const COOLDOWN_SECONDS = 60

export function ResendVerificationButton({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleResend() {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error()

      toast.success("Verification email sent! Check your inbox.")
      setCooldown(COOLDOWN_SECONDS)
    } catch {
      toast.error("Failed to send email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (cooldown > 0) {
    return (
      <p className="text-xs text-muted-foreground text-center">
        Resend available in{" "}
        <span className="font-medium text-foreground tabular-nums">{cooldown}s</span>
      </p>
    )
  }

  return (
    <button
      onClick={handleResend}
      disabled={loading}
      className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      {loading ? "Sending…" : "Resend verification email"}
    </button>
  )
}
