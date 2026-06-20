"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptimizePrompt } from "@/lib/mutations/ai";

interface PromptOptimizerButtonProps {
  title: string;
  content: string;
  onAccept: (optimized: string) => void;
  isPro: boolean;
}

export function PromptOptimizerButton({ title, content, onAccept, isPro }: PromptOptimizerButtonProps) {
  const [optimized, setOptimized] = useState<string | null>(null);

  const mutation = useOptimizePrompt((result) => setOptimized(result));

  if (!isPro) return null;

  function handleOptimize() {
    setOptimized(null);
    mutation.mutate({ title, content });
  }

  function accept() {
    if (optimized) onAccept(optimized);
    setOptimized(null);
  }

  function discard() {
    setOptimized(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 self-start text-xs gap-1.5 text-muted-foreground"
        onClick={handleOptimize}
        disabled={mutation.isPending || !title.trim() || !content.trim()}
      >
        {mutation.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {mutation.isPending ? "Optimizing…" : "Optimize Prompt"}
      </Button>

      {optimized && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Optimized version</p>
          <div className="markdown-preview text-sm max-h-64 overflow-y-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimized}</ReactMarkdown>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button type="button" variant="default" size="sm" className="h-7 text-xs" onClick={accept}>
              Use this version
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={discard}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
