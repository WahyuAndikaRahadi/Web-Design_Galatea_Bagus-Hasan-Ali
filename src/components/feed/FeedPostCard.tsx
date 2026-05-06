"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { TrustScoreBadge } from "@/components/ui/TrustScoreBadge";
import { FeedCommentSection } from "./FeedComment";
import { FeedBookmarkButton } from "./FeedBookmarkButton";

interface PostCardProps {
  post: any;
  currentUserId?: string;
}

export function FeedPostCard({ post, currentUserId }: PostCardProps) {
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(false); // Should ideally come from API or initial data
  const [showComments, setShowComments] = useState(false);

  const isContribution = post.type === "CONTRIBUTION";
  const isEvent = post.type === "EVENT";

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/feed/${post.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikes((prev: number) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch {}
  };

  const getDeadlineColor = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 3) return "#FF4D4D"; // Red
    if (days < 7) return "#FFE500"; // Yellow
    return "#00D37F"; // Green
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "2px solid #000000",
        boxShadow: "4px 4px 0px #000000",
        borderRadius: "8px",
        marginBottom: "24px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "2px solid #000" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid #000", background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px" }}>
          {post.author.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "15px" }}>{post.author.name}</span>
            <TrustScoreBadge score={post.author.trustScore} level={post.author.trustLevel} variant="compact" />
          </div>
          <div style={{ fontSize: "12px", color: "#666", fontWeight: 600 }}>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: id })}
          </div>
        </div>
        <div style={{
          padding: "4px 10px",
          background: isContribution ? "#0047FF" : "#FFE500",
          color: isContribution ? "#fff" : "#000",
          border: "2px solid #000",
          borderRadius: "4px",
          fontSize: "10px",
          fontWeight: 900,
          fontFamily: "Space Grotesk, sans-serif",
          textTransform: "uppercase"
        }}>
          {isContribution ? "Contribution" : post.eventCategory}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px" }}>
        {isContribution ? (
          <>
            <p style={{ fontSize: "15px", lineHeight: 1.6, marginBottom: "12px" }}>{post.content}</p>
            {post.mediaUrl && (
              <div style={{ border: "2px solid #000", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                <img src={post.mediaUrl} alt="Contribution" style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {post.project && (
                <Link href={`/project/${post.project.id}`} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#F5F0E8", border: "2px solid #000", padding: "4px 10px", borderRadius: "4px", fontSize: "12px", fontWeight: 700, color: "#000", textDecoration: "none" }}>
                  📁 {post.project.title}
                </Link>
              )}
              {post.sdgTag && (
                <span style={{ background: "#000", color: "#FFE500", padding: "4px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 }}>
                  {post.sdgTag}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "18px", marginBottom: "8px" }}>{post.eventName}</h3>
            {post.content && <p style={{ fontSize: "14px", color: "#444", marginBottom: "12px" }}>{post.content}</p>}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
              <div style={{ background: "#F5F0E8", border: "2px solid #000", padding: "10px", borderRadius: "4px" }}>
                <div style={{ fontSize: "10px", fontWeight: 800, color: "#666", textTransform: "uppercase" }}>Deadline</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: getDeadlineColor(post.eventDeadline) }}>
                  {new Date(post.eventDeadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <a href={post.eventLink} target="_blank" rel="noopener noreferrer" style={{ background: "#FFE500", border: "2px solid #000", padding: "10px", borderRadius: "4px", textAlign: "center", textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 900, color: "#000" }}>Daftar / Info 🔗</div>
              </a>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {post.eventSkills.map((s: string) => (
                <span key={s} style={{ background: "#F5F0E8", border: "1px solid #000", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>#{s}</span>
              ))}
              {post.sdgTag && <span style={{ background: "#000", color: "#FFE500", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 }}>{post.sdgTag}</span>}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "2px solid #000", display: "flex", alignItems: "center", gap: "16px", background: "#F5F0E8" }}>
        <button 
          onClick={handleLike}
          style={{ 
            background: isLiked ? "#FF4D4D" : "transparent", 
            border: "2px solid #000", 
            borderRadius: "4px", 
            padding: "6px 12px", 
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            cursor: "pointer",
            boxShadow: "2px 2px 0px #000",
            transition: "all 0.1s"
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = "translate(1px, 1px)"; e.currentTarget.style.boxShadow = "1px 1px 0px #000"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0px #000"; }}
        >
          <span style={{ fontSize: "16px" }}>{isLiked ? "❤️" : "🤍"}</span>
          <span style={{ fontWeight: 800, fontSize: "14px" }}>{likes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          style={{ 
            background: "transparent", 
            border: "2px solid #000", 
            borderRadius: "4px", 
            padding: "6px 12px", 
            display: "flex", 
            alignItems: "center", 
            gap: "6px", 
            cursor: "pointer",
            boxShadow: "2px 2px 0px #000"
          }}
        >
          <span style={{ fontSize: "16px" }}>💬</span>
          <span style={{ fontWeight: 800, fontSize: "14px" }}>{post._count.comments}</span>
        </button>

        <div style={{ marginLeft: "auto" }}>
          <FeedBookmarkButton postId={post.id} initialBookmarked={false} />
        </div>
      </div>

      {showComments && (
        <FeedCommentSection postId={post.id} currentUserId={currentUserId} />
      )}
    </div>
  );
}
