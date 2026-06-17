import { useState } from "react";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

export function useCopyToClipboard(duration = 1500) {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), duration);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  }

  return { copied, copy };
}
