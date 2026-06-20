"use client";

import { useState } from "react";
import { Sparkles, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSuggestTags } from "@/lib/mutations/ai";

interface TagSuggestionsProps {
  title: string;
  content?: string;
  existingTags: string[];
  onAccept: (tag: string) => void;
  isPro: boolean;
}

export function TagSuggestions({ title, content, existingTags, onAccept, isPro }: TagSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const mutation = useSuggestTags((tags) => {
    setSuggestions(tags.filter((tag) => !existingTags.includes(tag)));
  });

  if (!isPro) return null;

  function handleSuggest() {
    setSuggestions([]);
    mutation.mutate({ title, content });
  }

  function accept(tag: string) {
    onAccept(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function reject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 self-start text-xs gap-1.5 text-muted-foreground"
        onClick={handleSuggest}
        disabled={mutation.isPending || !title.trim()}
      >
        <Sparkles className="size-3.5" />
        {mutation.isPending ? "Suggesting…" : "Suggest Tags"}
      </Button>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {suggestions.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs gap-1 border-dashed">
              {tag}
              <button
                type="button"
                onClick={() => accept(tag)}
                className="text-muted-foreground hover:text-green-500"
                title="Accept"
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => reject(tag)}
                className="text-muted-foreground hover:text-destructive"
                title="Reject"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
