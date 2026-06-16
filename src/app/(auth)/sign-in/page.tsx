import { SignInForm } from "@/components/auth/SignInForm"

export default function SignInPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">Sign in to your Grimoire</p>
      </div>
      <SignInForm />
    </div>
  )
}
