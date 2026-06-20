"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGenerateDescription } from "@/lib/mutations/ai";

interface GenerateDescriptionButtonProps {
  title: string;
  content?: string;
  url?: string;
  fileName?: string;
  onGenerated: (summary: string) => void;
  isPro: boolean;
}

export function GenerateDescriptionButton({
  title,
  content,
  url,
  fileName,
  onGenerated,
  isPro,
}: GenerateDescriptionButtonProps) {
  const mutation = useGenerateDescription(onGenerated);

  if (!isPro) return null;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={mutation.isPending || !title.trim()}
            onClick={() => mutation.mutate({ title, content, url, fileName })}
          >
            {mutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
          </Button>
        }
      />
      <TooltipContent>Generate description with AI</TooltipContent>
    </Tooltip>
  );
}
