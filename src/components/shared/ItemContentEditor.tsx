"use client";

import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { CODE_TYPE_SLUGS, MARKDOWN_TYPE_SLUGS } from "@/lib/item-types";

interface ItemContentEditorProps {
  typeSlug: string;
  value: string;
  mode: "view" | "edit";
  onChange?: (value: string) => void;
  language?: string;
  isPro?: boolean;
  explainEnabled?: boolean;
  placeholder?: string;
}

export function ItemContentEditor({
  typeSlug,
  value,
  mode,
  onChange,
  language,
  isPro,
  explainEnabled,
  placeholder,
}: ItemContentEditorProps) {
  const readOnly = mode === "view";

  if (CODE_TYPE_SLUGS.has(typeSlug)) {
    return (
      <CodeEditor
        value={value}
        onChange={onChange}
        language={language}
        readOnly={readOnly}
        explainEnabled={readOnly ? explainEnabled : undefined}
        isPro={isPro}
      />
    );
  }

  if (MARKDOWN_TYPE_SLUGS.has(typeSlug)) {
    return (
      <MarkdownEditor
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
      />
    );
  }

  if (readOnly) {
    return (
      <div className="rounded-lg bg-background/60 border border-border p-4">
        <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all">
          {value}
        </pre>
      </div>
    );
  }

  return (
    <Textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  );
}
