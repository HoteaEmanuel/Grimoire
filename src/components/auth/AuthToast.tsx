"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

export function AuthToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("toast") === "signin") {
      toast.success("Signed in successfully")
      router.replace("/dashboard")
    }
  }, [searchParams, router])

  return null
}
