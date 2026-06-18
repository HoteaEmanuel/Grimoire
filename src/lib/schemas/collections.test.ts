import { describe, it, expect } from "vitest";
import { createCollectionSchema } from "./collections";

describe("createCollectionSchema", () => {
  it("accepts a name with no description", () => {
    const result = createCollectionSchema.safeParse({ name: "React Patterns" });
    expect(result.success).toBe(true);
  });

  it("accepts a name with a description", () => {
    const result = createCollectionSchema.safeParse({
      name: "React Patterns",
      description: "Reusable hooks and patterns",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createCollectionSchema.safeParse({ name: "  React Patterns  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("React Patterns");
  });

  it("rejects an empty name", () => {
    const result = createCollectionSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name is required");
    }
  });

  it("rejects a whitespace-only name", () => {
    const result = createCollectionSchema.safeParse({ name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a missing name", () => {
    const result = createCollectionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
