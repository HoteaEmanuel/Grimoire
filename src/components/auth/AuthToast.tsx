"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function AuthToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const toastParam = searchParams.get("toast")
    const errorParam = searchParams.get("error")

    if (toastParam === "signin") {
      toast.success("Signed in successfully")
      router.replace("/dashboard")
    } else if (toastParam === "email-verified") {
      toast.success("Email verified! You can now sign in.")
      router.replace("/sign-in")
    } else if (errorParam === "token-expired") {
      toast.error("This verification link has expired. Please register again.")
      router.replace("/sign-in")
    } else if (errorParam === "invalid-token") {
      toast.error("Invalid verification link.")
      router.replace("/sign-in")
    } else if (toastParam === "password-reset") {
      toast.success("Password reset successfully! You can now sign in.")
      router.replace("/sign-in")
    }
  }, [searchParams, router])

  return null
}
