"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Globe, FolderOpen, Tag, Calendar, Download } from "lucide-react";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Button } from "@/components/ui/button";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import type { ItemDetail } from "@/lib/db/items";

const CODE_TYPES = new Set(["snippets", "commands"]);
const MARKDOWN_TYPES = new Set(["prompts", "notes"]);

interface ItemDrawerViewBodyProps {
  item: ItemDetail;
  userIsPro: boolean;
}

export function ItemDrawerViewBody({ item, userIsPro }: ItemDrawerViewBodyProps) {
  const router = useRouter();
  const closeDrawer = useItemDrawerStore((state) => state.closeDrawer);

  function goToCollection(id: string) {
    closeDrawer();
    router.push(`/collections/${id}`);
  }

  return (
    <div className="space-y-6">
      {item.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      )}

      {item.content && (
        CODE_TYPES.has(item.typeSlug) ? (
          <CodeEditor
            value={item.content}
            language={item.language ?? undefined}
            readOnly
            explainEnabled
            isPro={userIsPro}
          />
        ) : MARKDOWN_TYPES.has(item.typeSlug) ? (
          <MarkdownEditor value={item.content} readOnly />
        ) : (
          <div className="rounded-lg bg-background/60 border border-border p-4">
            <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all">
              {item.content}
            </pre>
          </div>
        )
      )}

      {item.url && (
        <div className="flex items-center gap-2 text-sm">
          <Globe size={14} className="text-muted-foreground shrink-0" />
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate"
          >
            {item.url}
          </a>
        </div>
      )}

      {item.contentKind === "FILE" && (
        <div className="space-y-3">
          {item.typeSlug === "images" && item.fileUrl && (
            <Image
              src={item.fileUrl}
              alt={item.fileName ?? item.title}
              width={800}
              height={600}
              className="w-full rounded-lg border border-border object-contain max-h-80"
              style={{ height: "auto" }}
            />
          )}
          {item.fileName && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.fileName}</p>
                {item.fileSize != null && (
                  <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
                )}
              </div>
              {item.fileUrl && (
                <a
                  href={`/api/download/${new URL(item.fileUrl).pathname.slice(1)}`}
                  download={item.fileName}
                  title="Download"
                  className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Download size={15} />
                </a>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 text-sm">
        {item.language && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-xs uppercase tracking-wider w-24 shrink-0">Language</span>
            <span className="font-mono text-foreground/80">{item.language}</span>
          </div>
        )}

        {item.tags.length > 0 && (
          <div className="flex items-start gap-3 text-muted-foreground">
            <Tag size={13} className="mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {item.collections.length > 0 && (
          <div className="flex items-start gap-3 text-muted-foreground">
            <FolderOpen size={13} className="mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {item.collections.map((col) => (
                <Button
                  key={col.id}
                  type="button"
                  onClick={() => goToCollection(col.id)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {col.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground pt-1">
          <Calendar size={13} className="shrink-0" />
          <span className="text-xs">{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
