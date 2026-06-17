"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, readOnly = false, placeholder }: MarkdownEditorProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1a1612]">
      {/* macOS chrome header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#221e19] border-b border-white/6">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57] opacity-90" />
          <span className="size-3 rounded-full bg-[#febc2e] opacity-90" />
          <span className="size-3 rounded-full bg-[#28c840] opacity-90" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/60 font-mono">markdown</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy"}
            className="size-5 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </Button>
        </div>
      </div>

      {/* Body */}
      {readOnly ? (
        <div
          className="markdown-preview overflow-y-auto px-4 py-3 text-sm"
          style={{ minHeight: 80, maxHeight: 400 }}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground/40 italic text-xs">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <Tabs defaultValue="write" className="gap-0">
          <div className="px-3 pt-2 bg-[#1a1612] border-b border-white/6">
            <TabsList className="h-7 rounded-md px-0.5 bg-white/5">
              <TabsTrigger value="write" className="h-6 text-xs px-3">Write</TabsTrigger>
              <TabsTrigger value="preview" className="h-6 text-xs px-3">Preview</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="write">
            <Textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder ?? "Write markdown here…"}
              className="resize-none rounded-none border-0 bg-transparent text-sm font-mono min-h-[160px] max-h-[400px] focus-visible:ring-0 focus-visible:ring-offset-0 p-3"
            />
          </TabsContent>
          <TabsContent value="preview">
            <div
              className="markdown-preview overflow-y-auto px-4 py-3 text-sm"
              style={{ minHeight: 160, maxHeight: 400 }}
            >
              {value.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground/40 italic text-xs">Nothing to preview.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
