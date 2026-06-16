import { describe, it, expect, vi, beforeEach } from "vitest";
import { formatDate, formatFileSize, copyToClipboard } from "./utils";

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-03-15"));
    expect(result).toBe("Mar 15, 2024");
  });

  it("formats an ISO string", () => {
    const result = formatDate("2024-01-01T00:00:00.000Z");
    expect(result).toMatch(/Jan 1, 2024/);
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1_572_864)).toBe("1.5 MB");
  });

  it("rounds to one decimal place", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });
});

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it("writes to clipboard and returns true on success", async () => {
    const result = await copyToClipboard("hello");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(result).toBe(true);
  });

  it("returns false when clipboard throws", async () => {
    vi.stubGlobal("navigator", {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
    });
    const result = await copyToClipboard("hello");
    expect(result).toBe(false);
  });
});
