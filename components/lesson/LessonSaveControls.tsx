"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  slug: string;
  initialFavorite?: boolean;
  initialBookmark?: boolean;
};

export default function LessonSaveControls({
  slug,
  initialFavorite = false,
  initialBookmark = false,
}: Props) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [bookmark, setBookmark] = useState(initialBookmark);
  const [busy, setBusy] = useState(false);

  async function toggle(kind: "favorite" | "bookmark") {
    if (busy) return;

    setBusy(true);

    const optimistic = kind === "favorite" ? !favorite : !bookmark;

    if (kind === "favorite") {
      setFavorite(optimistic);
    } else {
      setBookmark(optimistic);
    }

    try {
      const res = await fetch("/api/lessons/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, kind }),
      });

      const data = (await res.json()) as { active?: boolean };

      if (typeof data.active === "boolean") {
        if (kind === "favorite") {
          setFavorite(data.active);
        } else {
          setBookmark(data.active);
        }
      }

      router.refresh();
    } catch {
      if (kind === "favorite") {
        setFavorite(!optimistic);
      } else {
        setBookmark(!optimistic);
      }
    }

    setBusy(false);
  }

  return (
    <div
      className="flex items-center gap-1.5"
      aria-label="Lesson collection controls"
    >
      <button
        type="button"
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorite}
        disabled={busy}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void toggle("favorite");
        }}
        className={
          "flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-wait disabled:opacity-60 " +
          (favorite
            ? "border-red-200 bg-red-50 text-[var(--mat-red)]"
            : "border-[var(--mat-border)] bg-white text-[var(--mat-muted-light)] hover:border-red-200 hover:bg-red-50 hover:text-[var(--mat-red)]")
        }
        title={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill={favorite ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z" />
        </svg>
      </button>

      <button
        type="button"
        aria-label={bookmark ? "Remove from saved" : "Save for later"}
        aria-pressed={bookmark}
        disabled={busy}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void toggle("bookmark");
        }}
        className={
          "flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-wait disabled:opacity-60 " +
          (bookmark
            ? "border-[var(--mat-border-green)] bg-[var(--mat-green-50)] text-[var(--mat-green-700)]"
            : "border-[var(--mat-border)] bg-white text-[var(--mat-muted-light)] hover:border-[var(--mat-border-green)] hover:bg-[var(--mat-green-50)] hover:text-[var(--mat-green-700)]")
        }
        title={bookmark ? "Remove from saved" : "Save for later"}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill={bookmark ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
        </svg>
      </button>
    </div>
  );
}
