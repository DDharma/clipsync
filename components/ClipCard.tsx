"use client";

import { Clip } from "@/lib/types";
import { showToast } from "./Toast";

interface ClipCardProps {
  clip: Clip;
  onDelete: (id: string) => void;
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied!");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("Copied!");
  }
}

async function copyImage(clip: Clip) {
  try {
    const res = await fetch(`/api/clipboard/download?id=${clip.id}`);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob }),
    ]);
    showToast("Image copied!");
  } catch {
    downloadClip(clip);
  }
}

function downloadClip(clip: Clip) {
  const a = document.createElement("a");
  a.href = `/api/clipboard/download?id=${clip.id}`;
  a.download = clip.fileName || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Downloading...", "info");
}

export default function ClipCard({ clip, onDelete }: ClipCardProps) {
  const handleCopy = () => {
    if (clip.type === "text") {
      copyText(clip.content);
    } else if (clip.type === "image") {
      copyImage(clip);
    } else {
      downloadClip(clip);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-slide-up hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted mb-2">
            {clip.type === "text" && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            {clip.type === "image" && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {clip.type === "file" && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            <span>{clip.deviceName}</span>
            <span>·</span>
            <span>{formatTime(clip.timestamp)}</span>
          </div>

          {clip.type === "text" && (
            <p className="font-mono text-sm text-text whitespace-pre-wrap break-words line-clamp-5">
              {clip.content}
            </p>
          )}

          {clip.type === "image" && (
            <div className="mt-1">
              <img
                src={`data:${clip.mimeType};base64,${clip.content}`}
                alt={clip.fileName || "Image"}
                className="max-h-40 rounded-lg object-contain"
              />
              {clip.fileName && (
                <p className="text-xs text-muted mt-1">{clip.fileName}</p>
              )}
            </div>
          )}

          {clip.type === "file" && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm text-text">{clip.fileName}</span>
              {clip.fileSize && (
                <span className="text-xs text-muted">({formatFileSize(clip.fileSize)})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors"
            title={clip.type === "text" ? "Copy" : clip.type === "image" ? "Copy image" : "Download"}
          >
            {clip.type === "file" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {(clip.type === "image" || clip.type === "file") && (
            <button
              onClick={() => downloadClip(clip)}
              className="p-2 rounded-lg hover:bg-secondary/10 text-muted hover:text-secondary transition-colors"
              title="Download"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onDelete(clip.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
