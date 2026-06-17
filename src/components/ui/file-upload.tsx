"use client";

import { useRef, useState } from "react";
import { Upload, X, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export type UploadResult = {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  key: string;
};

interface FileUploadProps {
  typeSlug: "files" | "images";
  onUpload: (result: UploadResult) => void;
  onClear?: () => void;
  value?: UploadResult | null;
}

const ACCEPT_MAP = {
  images: ".png,.jpg,.jpeg,.gif,.webp,.svg",
  files: ".pdf,.txt,.md,.json,.yaml,.yml,.xml,.csv,.toml,.ini",
};

const MAX_SIZE_MAP = {
  images: 5 * 1024 * 1024,
  files: 10 * 1024 * 1024,
};

const MAX_LABEL_MAP = {
  images: "5 MB",
  files: "10 MB",
};

type Status = "idle" | "uploading" | "done" | "error";

export function FileUpload({ typeSlug, onUpload, onClear, value }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(value ? "done" : "idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value?.fileUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(value?.fileName ?? null);
  const [fileSize, setFileSize] = useState<number | null>(value?.fileSize ?? null);
  const [dragging, setDragging] = useState(false);

  async function processFile(file: File) {
    setError(null);

    const maxSize = MAX_SIZE_MAP[typeSlug];
    if (file.size > maxSize) {
      setError(`File exceeds the ${MAX_LABEL_MAP[typeSlug]} limit`);
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setFileName(file.name);
    setFileSize(file.size);

    if (typeSlug === "images") {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("typeSlug", typeSlug);

      const result = await new Promise<{ fileUrl: string; key: string; fileName: string; fileSize: number }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const body = JSON.parse(xhr.responseText ?? "{}");
            reject(new Error(body?.error ?? "Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(fd);
      });

      setStatus("done");
      setPreview(result.fileUrl);
      onUpload({ fileUrl: result.fileUrl, fileName: file.name, fileSize: file.size, key: result.key });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
      setStatus("error");
      setPreview(null);
      setFileName(null);
      setFileSize(null);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    processFile(files[0]);
  }

  function handleClear() {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (status === "done" && fileName) {
    return (
      <div className="rounded-lg border border-border bg-background/40 p-3 flex items-center gap-3">
        {typeSlug === "images" && preview ? (
          <img
            src={preview}
            alt={fileName}
            className="h-12 w-12 rounded object-cover shrink-0 border border-border"
          />
        ) : (
          <div className="h-12 w-12 rounded border border-border bg-muted flex items-center justify-center shrink-0">
            <FileIcon size={20} className="text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          {fileSize != null && (
            <p className="text-xs text-muted-foreground">{formatSize(fileSize)}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          title="Remove file"
        >
          <X size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors outline-none
          ${dragging ? "border-primary/70 bg-primary/5" : "border-border hover:border-border/80 hover:bg-white/3"}
          ${status === "uploading" ? "pointer-events-none" : ""}
        `}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MAP[typeSlug]}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {typeSlug === "images" ? (
          <ImageIcon size={28} className="text-muted-foreground" />
        ) : (
          <Upload size={28} className="text-muted-foreground" />
        )}

        <div>
          <p className="text-sm font-medium">
            {status === "uploading" ? "Uploading…" : "Drop file here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {typeSlug === "images"
              ? `PNG, JPG, GIF, WebP, SVG — max ${MAX_LABEL_MAP.images}`
              : `PDF, TXT, MD, JSON, YAML, XML, CSV, TOML, INI — max ${MAX_LABEL_MAP.files}`}
          </p>
        </div>

        {status === "uploading" && (
          <div className="w-full max-w-xs space-y-1">
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">{progress}%</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
