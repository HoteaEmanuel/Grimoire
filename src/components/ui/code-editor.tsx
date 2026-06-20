"use client";

import dynamic from "next/dynamic";
import { Copy, Check, Sparkles, Crown, Loader2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { useEditorPreferencesStore } from "@/lib/stores/editor-preferences-store";
import { registerMonacoThemes } from "@/lib/monaco-themes";
import { useExplainCode } from "@/lib/mutations/ai";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  explainEnabled?: boolean;
  isPro?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  explainEnabled = false,
  isPro = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [tab, setTab] = useState<"code" | "explain">("code");
  const { fontSize, tabSize, wordWrap, minimap, theme } =
    useEditorPreferencesStore((state) => state.preferences);

  const explainMutation = useExplainCode((text) => {
    setExplanation(text);
    setTab("explain");
  });

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const editorHeight = readOnly
    ? Math.min(Math.max(value.split("\n").length * 19 + 24, 80), 400)
    : 280;

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-[#1a1612]">
      {/* macOS chrome header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#221e19] border-b border-white/6">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57] opacity-90" />
          <span className="size-3 rounded-full bg-[#febc2e] opacity-90" />
          <span className="size-3 rounded-full bg-[#28c840] opacity-90" />
        </div>

        {explanation !== null ? (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "code" | "explain")}
          >
            <TabsList className="h-6 rounded-md px-0.5 bg-white/5">
              <TabsTrigger value="code" className="h-5 text-[11px] px-2.5">
                Code
              </TabsTrigger>
              <TabsTrigger value="explain" className="h-5 text-[11px] px-2.5">
                Explain
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          language && (
            <span className="text-[11px] text-muted-foreground/60 font-mono">
              {language}
            </span>
          )
        )}

        <div className="flex items-center gap-2">
          {explainEnabled &&
            (isPro ? (
              <button
                type="button"
                onClick={() =>
                  explainMutation.mutate({ code: value, language })
                }
                disabled={explainMutation.isPending}
                title="Explain this code"
                className="flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {explainMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="flex items-center justify-center size-5 rounded text-muted-foreground/30 cursor-not-allowed">
                      <Crown size={12} />
                    </span>
                  }
                />
                <TooltipContent>
                  AI features require Pro subscription
                </TooltipContent>
              </Tooltip>
            ))}
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy code"}
            className="flex items-center justify-center size-5 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {tab === "explain" && explanation !== null ? (
        <div
          className="markdown-preview overflow-y-auto px-4 py-3 text-sm"
          style={{ height: editorHeight }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {explanation}
          </ReactMarkdown>
        </div>
      ) : (
        <MonacoEditor
          height={editorHeight}
          language={language || "plaintext"}
          value={value}
          onChange={(v) => onChange?.(v ?? "")}
          theme={theme}
          beforeMount={registerMonacoThemes}
          options={{
            readOnly,
            minimap: { enabled: minimap },
            fontSize,
            tabSize,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: wordWrap ? "on" : "off",
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: readOnly ? "none" : "line",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: {
              vertical: "auto",
              horizontal: "hidden",
              verticalScrollbarSize: 6,
              useShadows: false,
            },
            fontFamily: "'JetBrains Mono', 'Geist Mono', monospace",
            fontLigatures: true,
            cursorBlinking: "smooth",
            contextmenu: false,
            folding: false,
            lineDecorationsWidth: 4,
          }}
        />
      )}
    </div>
  );
}
