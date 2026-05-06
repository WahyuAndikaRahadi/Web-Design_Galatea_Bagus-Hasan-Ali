"use client";

import { useState, useEffect } from "react";

interface CommentProps {
  postId: string;
  currentUserId?: string;
}

export function FeedCommentSection({ postId, currentUserId }: CommentProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/feed/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;

    setSending(true);
    try {
      // Basic mention detection
      const mentions = newComment.match(/@(\w+)/g)?.map(m => m.slice(1)) || [];

      const res = await fetch(`/api/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, mentions }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([...comments, comment]);
        setNewComment("");
      }
    } catch {
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: "16px", borderTop: "2px solid #000", background: "#FFFFFF" }}>
      {loading ? (
        <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>Memuat komentar...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
          {comments.map((c) => (
            <div key={c.id} style={{ display: "flex", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #000", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "12px", flexShrink: 0 }}>
                {c.author.name[0]}
              </div>
              <div style={{ background: "#F5F0E8", border: "2px solid #000", padding: "8px 12px", borderRadius: "0 8px 8px 8px", fontSize: "13px", position: "relative" }}>
                <div style={{ fontWeight: 800, fontSize: "11px", marginBottom: "2px" }}>{c.author.name}</div>
                <div style={{ lineHeight: 1.4 }}>{c.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentUserId && (
        <form onSubmit={handlePostComment} style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar... (@mention)"
            maxLength={200}
            style={{
              flex: 1,
              background: "#F5F0E8",
              border: "2px solid #000",
              padding: "10px 14px",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "inherit",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={sending || !newComment.trim()}
            style={{
              background: "#FFE500",
              border: "2px solid #000",
              borderRadius: "4px",
              padding: "0 20px",
              fontWeight: 900,
              fontSize: "14px",
              cursor: "pointer",
              boxShadow: "2px 2px 0px #000",
            }}
          >
            {sending ? "..." : "Kirim"}
          </button>
        </form>
      )}
    </div>
  );
}
