import { describe, it, expect } from "vitest"
import {
  signInSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/schemas/auth"

describe("signInSchema", () => {
  it("accepts valid credentials", () => {
    expect(signInSchema.safeParse({ email: "user@example.com", password: "pass" }).success).toBe(true)
  })

  it("rejects invalid email", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "pass" })
    expect(result.success).toBe(false)
  })

  it("rejects empty password", () => {
    const result = signInSchema.safeParse({ email: "user@example.com", password: "" })
    expect(result.success).toBe(false)
  })
})

describe("registerSchema", () => {
  const valid = {
    name: "Alice",
    email: "alice@example.com",
    password: "password123",
    confirmPassword: "password123",
  }

  it("accepts valid input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "different" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword")
    }
  })

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short", confirmPassword: "short" })
    expect(result.success).toBe(false)
  })

  it("rejects empty name", () => {
    expect(registerSchema.safeParse({ ...valid, name: "" }).success).toBe(false)
  })

  it("rejects invalid email", () => {
    expect(registerSchema.safeParse({ ...valid, email: "bad" }).success).toBe(false)
  })
})

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "user@example.com" }).success).toBe(true)
  })

  it("rejects invalid email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "not-valid" }).success).toBe(false)
  })
})

describe("resetPasswordSchema", () => {
  const valid = { password: "newpass123", confirmPassword: "newpass123" }

  it("accepts matching passwords", () => {
    expect(resetPasswordSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({ ...valid, confirmPassword: "other" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword")
    }
  })

  it("rejects password shorter than 8 characters", () => {
    expect(resetPasswordSchema.safeParse({ password: "short", confirmPassword: "short" }).success).toBe(false)
  })
})

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "oldpass123",
    newPassword: "newpass456",
    confirmPassword: "newpass456",
  }

  it("accepts valid input", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects when new password matches current password", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: "oldpass123",
      confirmPassword: "oldpass123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("newPassword")
    }
  })

  it("rejects mismatched confirm password", () => {
    const result = changePasswordSchema.safeParse({ ...valid, confirmPassword: "wrong" })
    expect(result.success).toBe(false)
  })

  it("rejects new password shorter than 8 characters", () => {
    expect(
      changePasswordSchema.safeParse({ ...valid, newPassword: "short", confirmPassword: "short" }).success
    ).toBe(false)
  })
})
