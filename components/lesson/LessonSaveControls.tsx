"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  initialFavorite?: boolean;
  initialBookmark?: boolean;
};

export default function LessonSaveControls({ slug, initialFavorite = false, initialBookmark = false }: Props) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [bookmark, setBookmark] = useState(initialBookmark);
  const [busy, setBusy] = useState(false);

  async function toggle(kind: "favorite" | "bookmark") {
    if (busy) return;
    setBusy(true);
    const optimistic = kind === "favorite" ? !favorite : !bookmark;
    if (kind === "favorite") setFavorite(optimistic);
    else setBookmark(optimistic);
    try {
      const res = await fetch("/api/lessons/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind }),
      });
      const data = (await res.json()) as { active?: boolean };
      if (typeof data.active === "boolean") {
        if (kind === "favorite") setFavorite(data.active);
        else setBookmark(data.active);
      }
      router.refresh();
    } catch {
      // revert on failure
      if (kind === "favorite") setFavorite(!optimistic);
      else setBookmark(!optimistic);
    }
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorite}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle("favorite"); }}
        className={
          "flex h-8 w-8 items-center justify-center rounded-lg border transition " +
          (favorite ? "border-[#f4c9c9] bg-[#fdecec] text-[#d1495b]" : "border-gray-200 bg-white text-gray-300 hover:text-[#d1495b]")
        }
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>
      <button
        type="button"
        aria-label={bookmark ? "Remove from saved" : "Save for later"}
        aria-pressed={bookmark}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle("bookmark"); }}
        className={
          "flex h-8 w-8 items-center justify-center rounded-lg border transition " +
          (bookmark ? "border-[#cdeee1] bg-[#e9f8f3] text-[#168c56]" : "border-gray-200 bg-white text-gray-300 hover:text-[#168c56]")
        }
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill={bookmark ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
        </svg>
      </button>
    </div>
  );
}
