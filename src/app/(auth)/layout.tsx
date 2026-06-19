import { Suspense } from "react"
import { AuthToast } from "@/components/auth/AuthToast"
import { Nav } from "@/components/home/Nav"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 pt-24">
      <Nav />
      <Suspense>
        <AuthToast />
      </Suspense>
      {children}
    </div>
  )
}
