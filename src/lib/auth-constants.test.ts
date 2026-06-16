import { describe, it, expect } from "vitest"
import { RESET_PREFIX, hashToken, safeCompare } from "@/lib/auth-constants"

describe("RESET_PREFIX", () => {
  it("has the expected value", () => {
    expect(RESET_PREFIX).toBe("reset:")
  })
})

describe("hashToken", () => {
  it("returns a 64-character hex string", () => {
    const result = hashToken("abc123")
    expect(result).toHaveLength(64)
    expect(result).toMatch(/^[0-9a-f]{64}$/)
  })

  it("is deterministic for the same input", () => {
    expect(hashToken("token")).toBe(hashToken("token"))
  })

  it("produces different hashes for different inputs", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"))
  })

  it("produces a known SHA-256 hash", () => {
    // sha256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    expect(hashToken("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
  })
})

describe("safeCompare", () => {
  it("returns true for identical strings", () => {
    expect(safeCompare("abc", "abc")).toBe(true)
  })

  it("returns false for different strings of the same length", () => {
    expect(safeCompare("abc", "xyz")).toBe(false)
  })

  it("returns false for strings of different lengths", () => {
    expect(safeCompare("short", "much-longer-string")).toBe(false)
  })

  it("returns false for empty vs non-empty", () => {
    expect(safeCompare("", "a")).toBe(false)
  })

  it("returns true for empty strings", () => {
    expect(safeCompare("", "")).toBe(true)
  })
})
