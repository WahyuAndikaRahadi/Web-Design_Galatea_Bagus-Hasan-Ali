"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Author {
  id: string;
  name: string;
  image?: string;
  trustScore?: number;
}

interface CommentData {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  content: string;
  mentions: string[];
  createdAt: string;
  author: Author;
  children?: CommentData[];
}

interface UserSuggestion {
  id: string;
  name: string;
  username: string;
  trustLevel: string;
}

interface Props {
  postId: string;
  currentUserId?: string;
}

export function FeedCommentSection({ postId, currentUserId }: Props) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string; rootId: string } | null>(null);
  const [mentionedUsers, setMentionedUsers] = useState<{ id: string; name: string }[]>([]);

  // Mention autocomplete
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<UserSuggestion[]>([]);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/feed/${postId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  // Mention search
  useEffect(() => {
    if (mentionSearch.length < 1) {
      setMentionSuggestions([]);
      setShowMentionSuggestions(false);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMentionSuggestions(data);
          setShowMentionSuggestions(data.length > 0);
        }
      } catch { }
    }, 200);
    return () => clearTimeout(timeout);
  }, [mentionSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewComment(val);
    checkMention(e.target);
  };

  const checkMention = (target: HTMLInputElement) => {
    const pos = target.selectionStart ?? 0;
    const textBefore = target.value.slice(0, pos);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setMentionSearch(match[1]);
      setCursorPosition(pos);
    } else {
      setMentionSearch("");
      setShowMentionSuggestions(false);
    }
  };

  const handleMentionSelect = (user: UserSuggestion) => {
    if (cursorPosition === null) return;
    const before = newComment.slice(0, cursorPosition).replace(/@\w*$/, `@${user.username} `);
    const after = newComment.slice(cursorPosition);
    setNewComment(before + after);
    setMentionedUsers((prev) => [...prev.filter((u) => u.id !== user.id), { id: user.id, name: user.name }]);
    setShowMentionSuggestions(false);
    inputRef.current?.focus();
  };

  const buildTree = (flat: CommentData[]): CommentData[] => {
    const map = new Map<string, CommentData & { children: CommentData[] }>();
    const roots: (CommentData & { children: CommentData[] })[] = [];
    flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
    flat.forEach((c) => {
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) parent.children.push(map.get(c.id)!);
      } else {
        roots.push(map.get(c.id)!);
      }
    });
    return roots;
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUserId) return;
    setSending(true);

    const mentionIds = mentionedUsers.map((u) => u.id);
    // parentId is always the ROOT comment id (no staircase)
    const parentId = replyTo?.rootId ?? null;

    try {
      const res = await fetch(`/api/feed/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, mentions: mentionIds, parentId }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
        setReplyTo(null);
        setMentionedUsers([]);
      }
    } catch { }
    finally { setSending(false); }
  };

  const handleReplyClick = (comment: CommentData, rootId: string) => {
    // When replying to a child, parentId = rootId; auto-prepend @username
    setReplyTo({ id: comment.id, name: comment.author.name, rootId });
    setNewComment(`@${(comment.author as any).username || comment.author.name.toLowerCase().replace(/\s+/g, "")} `);
    // Mark the mentioned user
    setMentionedUsers([{ id: comment.authorId, name: comment.author.name }]);
    inputRef.current?.focus();
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} style={{ color: "#00D37F", fontWeight: 800 }}>{part}</span>;
      }
      if (part.startsWith("#")) return <span key={i} style={{ color: "#0047FF", fontWeight: 800 }}>{part}</span>;
      return part;
    });
  };

  const highlightInput = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} style={{ color: "#00D37F", fontWeight: 800 }}>{part}</span>;
      }
      if (part.startsWith("#")) return <span key={i} style={{ color: "#0047FF", fontWeight: 800 }}>{part}</span>;
      return <span key={i} style={{ color: "#000" }}>{part}</span>;
    });
  };

  const commentTree = buildTree(comments);

  const renderReply = (c: CommentData, rootId: string) => (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ display: "flex", gap: "8px", marginTop: "8px" }}
    >
      <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #000", background: "#E6F0FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "10px", flexShrink: 0 }}>
        {c.author.name[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: "#fff", border: "2px solid #000", padding: "6px 10px", borderRadius: "0 8px 8px 8px", fontSize: "13px" }}>
          <div style={{ fontWeight: 800, fontSize: "11px", marginBottom: "2px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{c.author.name}</span>
            {currentUserId && (
              <button
                onClick={() => handleReplyClick(c, rootId)}
                style={{ background: "none", border: "none", color: "#0047FF", fontSize: "10px", fontWeight: 800, cursor: "pointer", padding: 0 }}
              >
                Reply
              </button>
            )}
          </div>
          <div style={{ lineHeight: 1.5 }}>{renderContent(c.content)}</div>
        </div>
      </div>
    </motion.div>
  );

  const renderRoot = (c: CommentData & { children: CommentData[] }) => (
    <motion.div
      key={c.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: "flex", gap: "10px" }}
    >
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid #000", background: "#FFE500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "13px", flexShrink: 0, boxShadow: "2px 2px 0 #000" }}>
        {c.author.name[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ background: "#F5F0E8", border: "2px solid #000", padding: "8px 12px", borderRadius: "0 8px 8px 8px", fontSize: "13px", boxShadow: "2px 2px 0 #000" }}>
          <div style={{ fontWeight: 900, fontSize: "12px", marginBottom: "3px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{c.author.name}</span>
            {currentUserId && (
              <button
                onClick={() => handleReplyClick(c, c.id)}
                style={{ background: "none", border: "none", color: "#0047FF", fontSize: "11px", fontWeight: 800, cursor: "pointer", padding: 0 }}
              >
                Reply
              </button>
            )}
          </div>
          <div style={{ lineHeight: 1.5 }}>{renderContent(c.content)}</div>
        </div>

        {/* Replies — all at the same level, no staircasing */}
        {c.children.length > 0 && (
          <div style={{ paddingLeft: "12px", borderLeft: "2px dashed #ccc", marginLeft: "14px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {c.children.map((child) => renderReply(child, c.id))}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div style={{ padding: "16px", borderTop: "2px solid #000", background: "#FAFAFA" }}>
      {loading ? (
        <div style={{ fontSize: "12px", color: "#666", textAlign: "center" }}>Memuat komentar...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
          {commentTree.map((c) => renderRoot(c as CommentData & { children: CommentData[] }))}
          {commentTree.length === 0 && (
            <div style={{ textAlign: "center", fontSize: "13px", color: "#999", padding: "8px 0" }}>Belum ada komentar. Jadilah yang pertama!</div>
          )}
        </div>
      )}

      {currentUserId && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: "11px", fontWeight: 700, color: "#666", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#E6F0FF", border: "1px solid #000", borderRadius: "4px", padding: "4px 10px" }}
            >
              <span>↩ Membalas {replyTo.name}</span>
              <button onClick={() => { setReplyTo(null); setNewComment(""); setMentionedUsers([]); }} style={{ background: "none", border: "none", color: "#FF4D4D", cursor: "pointer", fontWeight: 900, fontSize: "13px" }}>×</button>
            </motion.div>
          )}

          <div style={{ position: "relative" }}>
            <AnimatePresence>
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  style={{ position: "absolute", bottom: "100%", left: 0, width: "240px", background: "#fff", border: "2px solid #000", borderRadius: "4px", boxShadow: "3px 3px 0 #000", zIndex: 30, marginBottom: "6px", overflow: "hidden" }}
                >
                  <div style={{ padding: "6px 10px", fontSize: "11px", fontWeight: 900, background: "#F5F0E8", borderBottom: "1px solid #000" }}>MENTION USER</div>
                  {mentionSuggestions.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onMouseDown={() => handleMentionSelect(u)}
                      style={{ width: "100%", padding: "8px 10px", textAlign: "left", background: "#fff", border: "none", borderBottom: "1px solid #eee", cursor: "pointer", fontWeight: 700, fontSize: "13px", fontFamily: "inherit" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#E6F0FF"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                    >
                      <div style={{ fontWeight: 800 }}>@{u.username}</div>
                      <div style={{ fontSize: "11px", opacity: 0.6 }}>{u.name}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handlePostComment} style={{ display: "flex", gap: "8px" }}>
              <div style={{ flex: 1, position: "relative", border: "2px solid #000", borderRadius: "4px", background: "#F5F0E8", boxShadow: "2px 2px 0 #000", overflow: "hidden" }}>
                {/* Overlay */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  padding: "9px 13px",
                  pointerEvents: "none",
                  fontFamily: "inherit",
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  color: "transparent",
                  zIndex: 2
                }}>
                  {newComment ? highlightInput(newComment) : (
                    <span style={{ color: "#666", opacity: 0.7 }}>
                      {replyTo ? `Balas ${replyTo.name}...` : "Tulis komentar... (@ untuk mention)"}
                    </span>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={handleInputChange}
                  onKeyUp={(e) => checkMention(e.currentTarget)}
                  maxLength={200}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "9px 13px",
                    fontSize: "13px",
                    fontFamily: "inherit",
                    outline: "none",
                    color: "transparent",
                    caretColor: "#000",
                    position: "relative",
                    zIndex: 1
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={sending || !newComment.trim()}
                style={{ background: "#FFE500", border: "2px solid #000", borderRadius: "4px", padding: "0 18px", fontWeight: 900, fontSize: "14px", cursor: "pointer", boxShadow: "2px 2px 0 #000", flexShrink: 0 }}
              >
                {sending ? "..." : "Kirim"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
