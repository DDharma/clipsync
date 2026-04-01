"use client";

import { Clip } from "@/lib/types";
import ClipCard from "./ClipCard";

interface ClipFeedProps {
  clips: Clip[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function ClipFeed({ clips, onDelete, onClearAll }: ClipFeedProps) {
  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted">
        <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="font-medium">No clips yet</p>
        <p className="text-sm mt-1">Copy something or type above to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{clips.length} clip{clips.length !== 1 ? "s" : ""}</span>
        <button
          onClick={onClearAll}
          className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
        >
          Clear all
        </button>
      </div>
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} onDelete={onDelete} />
      ))}
    </div>
  );
}
