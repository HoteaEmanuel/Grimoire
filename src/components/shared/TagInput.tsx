"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const TAG_RE = /^[a-z0-9_-]+$/;

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Type a tag and press Enter or comma",
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const raw = input.trim().toLowerCase();
    if (!raw) return;
    if (!TAG_RE.test(raw)) {
      setError("Tags can only contain lowercase letters, numbers, - and _");
      return;
    }
    if (!tags.includes(raw)) onChange([...tags, raw]);
    setInput("");
    setError("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(""); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
