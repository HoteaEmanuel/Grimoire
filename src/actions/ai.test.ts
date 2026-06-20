import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { generateAutoTags } from "./ai";

vi.mock("@/lib/openai", () => ({
  openai: { responses: { create: vi.fn() } },
  AI_MODEL: "gpt-5-nano",
}));

vi.mock("@/lib/rate-limit", () => ({
  aiFeatureLimiter: {},
  checkRateLimit: vi.fn(),
}));

import { openai } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

const mockSession = { user: { id: "user-1", isPro: true } };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(checkRateLimit).mockResolvedValue({ success: true, retryAfter: 0 });
});

describe("generateAutoTags", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await generateAutoTags({ title: "Test" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns a Pro-gating error for free users", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await generateAutoTags({ title: "Test" });

    expect(result).toEqual({ success: false, error: "AI tag suggestions are a Pro feature" });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns a validation error for an empty title", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const result = await generateAutoTags({ title: "" });

    expect(result.success).toBe(false);
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects the request", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, retryAfter: 120 });

    const result = await generateAutoTags({ title: "Test" });

    expect(result).toEqual({
      success: false,
      error: "Too many AI requests. Try again in 2 minutes.",
    });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns normalized, lowercased tags on success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ tags: ["React", "Web Dev", "TypeScript"] }),
    } as never);

    const result = await generateAutoTags({ title: "useState hook", content: "const [x, setX] = useState(0)" });

    expect(result).toEqual({ success: true, data: { tags: ["react", "web-dev", "typescript"] } });
  });

  it("filters out tags that don't match the allowed tag format", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ tags: ["valid-tag", "invalid!tag", ""] }),
    } as never);

    const result = await generateAutoTags({ title: "Test" });

    expect(result).toEqual({ success: true, data: { tags: ["valid-tag"] } });
  });

  it("truncates content to 2000 chars before sending to the model", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ tags: ["tag"] }),
    } as never);

    const longContent = "a".repeat(3000);
    await generateAutoTags({ title: "Test", content: longContent });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a generic error when the AI service throws", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockRejectedValue(new Error("network error"));

    const result = await generateAutoTags({ title: "Test" });

    expect(result).toEqual({ success: false, error: "AI service is temporarily unavailable" });
  });
});
