import { RegisterForm } from "@/components/auth/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">Start building your Grimoire</p>
      </div>
      <RegisterForm />
    </div>
  )
}
