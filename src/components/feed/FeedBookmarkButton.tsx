"use client";

import { useState } from "react";

interface BookmarkProps {
  postId: string;
  initialBookmarked: boolean;
}

export function FeedBookmarkButton({ postId, initialBookmarked }: BookmarkProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggleBookmark = async () => {
    if (loading) return;
    setLoading(true);
    
    // Optimistic update
    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      const res = await fetch(`/api/feed/${postId}/bookmark`, { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setIsBookmarked(data.bookmarked);
    } catch {
      setIsBookmarked(prev); // Rollback
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      title={isBookmarked ? "Hapus Bookmark" : "Simpan Post"}
      style={{
        background: isBookmarked ? "#000" : "transparent",
        border: "2px solid #000",
        borderRadius: "4px",
        padding: "6px 8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "2px 2px 0px #000",
        transition: "all 0.1s"
      }}
    >
      <span style={{ fontSize: "16px", filter: isBookmarked ? "invert(1)" : "none" }}>
        {isBookmarked ? "🔖" : "📑"}
      </span>
    </button>
  );
}
