"use client";

import dynamic from "next/dynamic";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";
import { useEditorPreferencesStore } from "@/lib/stores/editor-preferences-store";
import { registerMonacoThemes } from "@/lib/monaco-themes";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { fontSize, tabSize, wordWrap, minimap, theme } = useEditorPreferencesStore(
    (state) => state.preferences,
  );

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
          {language && (
            <span className="text-[11px] text-muted-foreground/60 font-mono">{language}</span>
          )}
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

      {/* Monaco editor */}
      <MonacoEditor
        height={
          readOnly
            ? Math.min(Math.max(value.split("\n").length * 19 + 24, 80), 400)
            : 280
        }
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
    </div>
  );
}
