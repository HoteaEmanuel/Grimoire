import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { generateAutoTags, generateDescription, explainCode } from "./ai";

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

describe("generateDescription", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await generateDescription({ title: "Test" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns a Pro-gating error for free users", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await generateDescription({ title: "Test" });

    expect(result).toEqual({ success: false, error: "AI descriptions are a Pro feature" });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns a validation error for an empty title", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const result = await generateDescription({ title: "" });

    expect(result.success).toBe(false);
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects the request", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, retryAfter: 120 });

    const result = await generateDescription({ title: "Test" });

    expect(result).toEqual({
      success: false,
      error: "Too many AI requests. Try again in 2 minutes.",
    });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns the generated summary on success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ summary: "  A hook for managing local state.  " }),
    } as never);

    const result = await generateDescription({ title: "useState hook", content: "const [x, setX] = useState(0)" });

    expect(result).toEqual({ success: true, data: { summary: "A hook for managing local state." } });
  });

  it("includes url and fileName in the prompt when provided", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ summary: "summary" }),
    } as never);

    await generateDescription({ title: "Test", url: "https://example.com", fileName: "report.pdf" });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("URL: https://example.com");
    expect(call.input).toContain("File name: report.pdf");
  });

  it("omits content/url/fileName lines from the prompt when not provided", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ summary: "summary" }),
    } as never);

    await generateDescription({ title: "Test" });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toBe("Title: Test");
  });

  it("truncates content to 2000 chars before sending to the model", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ summary: "summary" }),
    } as never);

    const longContent = "a".repeat(3000);
    await generateDescription({ title: "Test", content: longContent });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a generic error when the AI service throws", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockRejectedValue(new Error("network error"));

    const result = await generateDescription({ title: "Test" });

    expect(result).toEqual({ success: false, error: "AI service is temporarily unavailable" });
  });
});

describe("explainCode", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await explainCode({ code: "const x = 1;" });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns a Pro-gating error for free users", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "user-1", isPro: false } } as never);

    const result = await explainCode({ code: "const x = 1;" });

    expect(result).toEqual({ success: false, error: "AI code explanations are a Pro feature" });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns a validation error for empty code", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);

    const result = await explainCode({ code: "" });

    expect(result.success).toBe(false);
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns a rate-limit error when the limiter rejects the request", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, retryAfter: 120 });

    const result = await explainCode({ code: "const x = 1;" });

    expect(result).toEqual({
      success: false,
      error: "Too many AI requests. Try again in 2 minutes.",
    });
    expect(openai.responses.create).not.toHaveBeenCalled();
  });

  it("returns the generated explanation on success", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ explanation: "  This declares a constant.  " }),
    } as never);

    const result = await explainCode({ code: "const x = 1;", language: "typescript" });

    expect(result).toEqual({ success: true, data: { explanation: "This declares a constant." } });
  });

  it("includes the language in the prompt when provided", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ explanation: "explanation" }),
    } as never);

    await explainCode({ code: "const x = 1;", language: "typescript" });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("Language: typescript");
  });

  it("omits the language line from the prompt when not provided", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ explanation: "explanation" }),
    } as never);

    await explainCode({ code: "const x = 1;" });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toBe("Code:\nconst x = 1;");
  });

  it("truncates code to 2000 chars before sending to the model", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockResolvedValue({
      output_text: JSON.stringify({ explanation: "explanation" }),
    } as never);

    const longCode = "a".repeat(3000);
    await explainCode({ code: longCode });

    const call = vi.mocked(openai.responses.create).mock.calls[0]![0] as { input: string };
    expect(call.input).toContain("a".repeat(2000));
    expect(call.input).not.toContain("a".repeat(2001));
  });

  it("returns a generic error when the AI service throws", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(openai.responses.create).mockRejectedValue(new Error("network error"));

    const result = await explainCode({ code: "const x = 1;" });

    expect(result).toEqual({ success: false, error: "AI service is temporarily unavailable" });
  });
});
