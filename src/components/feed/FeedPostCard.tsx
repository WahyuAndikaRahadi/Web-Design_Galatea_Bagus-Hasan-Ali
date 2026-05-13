"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { getTrustLevelEmoji, getTrustLevelLabel } from "@/lib/trust-score";
import { FeedCommentSection } from "./FeedComment";
import { FeedBookmarkButton } from "./FeedBookmarkButton";
import { AlertTriangle } from "lucide-react";
import { ReportPostModal } from "./ReportPostModal";

interface PostCardProps {
  post: any;
  currentUserId?: string;
}

export function FeedPostCard({ post, currentUserId }: PostCardProps) {
  const [likes, setLikes] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(false); // Should ideally come from API or initial data
  const [showComments, setShowComments] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

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

  const renderContent = (text: string) => {
    if (!text) return null;
    // Split on @username and #tag patterns
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} style={{ color: "#00D37F", fontWeight: 800 }}>{part}</span>;
      }
      if (part.startsWith("#")) {
        return <span key={i} style={{ color: "#0047FF", fontWeight: 800 }}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      style={{
        background: "#FFFFFF",
        border: "3px solid #222",
        borderRadius: "16px",
        marginBottom: "32px",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        position: "relative",
        boxShadow: "var(--card-shadow, 8px 8px 0px #222)",
      }}
      className="feed-card"
    >
      <style jsx>{`
        .feed-card {
          --card-shadow: 8px 8px 0px #222;
          --event-grid: 1fr 1fr;
        }
        @media (max-width: 600px) {
          .feed-card {
            --card-shadow: 4px 4px 0px #222;
            --event-grid: 1fr;
            margin-bottom: 24px !important;
          }
          .card-padding {
            padding: 16px !important;
          }
        }
      `}</style>
      {/* Type Ribbon/Tag */}
      <div style={{
        position: "absolute",
        top: "0",
        right: "0",
        padding: "6px 16px",
        background: isContribution ? "#0047FF" : "#FFE500",
        color: isContribution ? "#fff" : "#000",
        borderLeft: "3px solid #222",
        borderBottom: "3px solid #222",
        borderBottomLeftRadius: "12px",
        fontSize: "11px",
        fontWeight: 900,
        fontFamily: "Space Grotesk, sans-serif",
        textTransform: "uppercase",
        letterSpacing: "1px",
        zIndex: 2
      }}>
        {isContribution ? (post.project ? "📢 Progress" : "📢 Update") : `🏆 ${post.eventCategory}`}
      </div>

      {/* Header */}
      <div className="card-padding" style={{ 
        padding: "20px", 
        display: "flex", 
        alignItems: "center", 
        gap: "14px", 
        borderBottom: "2px solid #f0f0f0",
        background: "linear-gradient(135deg, #fff 0%, #fafafa 100%)",
        minWidth: 0 // Prevent overflow
      }}>
        <div style={{ 
          width: "48px", 
          height: "48px", 
          borderRadius: "12px", 
          border: "2px solid #222", 
          background: "#FFE500", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          fontWeight: 900, 
          fontSize: "20px",
          boxShadow: "3px 3px 0px #222",
          flexShrink: 0
        }}>
          {post.author.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ 
              fontFamily: "Space Grotesk, sans-serif", 
              fontWeight: 800, 
              fontSize: "16px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "100%"
            }}>{post.author.name}</span>
            
            {/* Improved Trust Badge */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: -2 }}
              title={`${getTrustLevelLabel(post.author.trustLevel)}: ${post.author.trustScore} pts`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "#1A1A2E",
                color: "#FFE500",
                border: "1.5px solid #222",
                borderRadius: "6px",
                padding: "2px 8px",
                boxShadow: "2px 2px 0px rgba(0,0,0,0.15)",
                cursor: "help"
              }}
            >
              <span style={{ fontSize: "12px" }}>{getTrustLevelEmoji(post.author.trustLevel)}</span>
              <span style={{ 
                fontFamily: "JetBrains Mono, monospace", 
                fontWeight: 700, 
                fontSize: "11px"
              }}>
                {post.author.trustScore}
              </span>
            </motion.div>
          </div>
          <div style={{ fontSize: "12px", color: "#888", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
            <span>🕒</span>
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: id })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="card-padding" style={{ padding: "20px", minWidth: 0 }}>
        {isContribution ? (
          <>
            <p style={{ fontSize: "16px", lineHeight: 1.7, marginBottom: "16px", whiteSpace: "pre-wrap", color: "#1a1a1a" }}>
              {renderContent(post.content)}
            </p>
            {post.mediaUrl && (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                style={{ border: "3px solid #000", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", boxShadow: "4px 4px 0px #000" }}
              >
                <img src={post.mediaUrl} alt="Contribution" style={{ width: "100%", height: "auto", display: "block" }} />
              </motion.div>
            )}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {post.project && (
                <Link href={`/project/${post.project.id}`} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  background: "#F5F0E8", 
                  border: "2px solid #000", 
                  padding: "6px 12px", 
                  borderRadius: "8px", 
                  fontSize: "13px", 
                  fontWeight: 700, 
                  color: "#000", 
                  textDecoration: "none",
                  boxShadow: "2px 2px 0px #000",
                  transition: "all 0.1s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translate(-1px, -1px)"; e.currentTarget.style.boxShadow = "3px 3px 0px #000"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0px #000"; }}
                >
                  <span style={{ fontSize: "16px" }}>📁</span> {post.project.title}
                </Link>
              )}
              {post.projectTopic && (
                <span style={{ 
                  background: "#FFE500", 
                  color: "#000", 
                  padding: "6px 12px", 
                  borderRadius: "8px", 
                  fontSize: "12px", 
                  fontWeight: 800, 
                  border: "2px solid #000",
                  boxShadow: "2px 2px 0px #000"
                }}>
                  #{post.projectTopic}
                </span>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
              <div style={{ background: "#FF4D4D", color: "#fff", width: "40px", height: "40px", borderRadius: "8px", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0, boxShadow: "2px 2px 0px #000" }}>
                🏆
              </div>
              <h3 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px", lineHeight: "1.2" }}>{post.eventName}</h3>
            </div>
            
            {post.content && (
              <p style={{ fontSize: "15px", color: "#444", marginBottom: "20px", whiteSpace: "pre-wrap", borderLeft: "4px solid #FFE500", paddingLeft: "12px" }}>
                {renderContent(post.content)}
              </p>
            )}
            
            <div style={{ display: "grid", gridTemplateColumns: "var(--event-grid)", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: "#F5F0E8", border: "2px solid #000", padding: "12px", borderRadius: "12px", boxShadow: "3px 3px 0px #000" }}>
                <div style={{ fontSize: "10px", fontWeight: 900, color: "#000", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>BATAS WAKTU</div>
                <div style={{ fontSize: "15px", fontWeight: 900, color: getDeadlineColor(post.eventDeadline), display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "18px" }}>📅</span>
                  {new Date(post.eventDeadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={post.eventLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ 
                  background: "#FFE500", 
                  border: "2px solid #000", 
                  padding: "12px", 
                  borderRadius: "12px", 
                  textAlign: "center", 
                  textDecoration: "none", 
                  display: "flex", 
                  flexDirection: "column", 
                  justifyContent: "center",
                  boxShadow: "3px 3px 0px #000"
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 900, color: "#000" }}>Daftar Sekarang 🔗</div>
              </motion.a>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {post.eventSkills.map((s: string) => (
                <span key={s} style={{ 
                  background: "#fff", 
                  border: "2px solid #000", 
                  padding: "4px 10px", 
                  borderRadius: "20px", 
                  fontSize: "12px", 
                  fontWeight: 800,
                  boxShadow: "2px 2px 0px #000"
                }}>#{s}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="card-padding" style={{ 
        padding: "14px 20px", 
        borderTop: "3px solid #000", 
        display: "flex", 
        alignItems: "center", 
        gap: "12px", // Slightly reduced gap for mobile
        background: "#FFFFFF",
        flexWrap: "wrap"
      }}>
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          style={{ 
            background: isLiked ? "#FF4D4D" : "#fff", 
            border: "2px solid #000", 
            borderRadius: "10px", 
            padding: "8px 12px", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            cursor: "pointer",
            boxShadow: "var(--card-shadow)",
            transition: "background 0.2s"
          }}
        >
          <span style={{ fontSize: "18px" }}>{isLiked ? "❤️" : "🤍"}</span>
          <span style={{ fontWeight: 900, fontSize: "14px", color: isLiked ? "#fff" : "#000" }}>{likes}</span>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.1, rotate: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(!showComments)}
          style={{ 
            background: showComments ? "#00D37F" : "#fff", 
            border: "2px solid #000", 
            borderRadius: "10px", 
            padding: "8px 12px", 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            cursor: "pointer",
            boxShadow: "var(--card-shadow)"
          }}
        >
          <span style={{ fontSize: "18px" }}>💬</span>
          <span style={{ fontWeight: 900, fontSize: "14px", color: showComments ? "#000" : "#000" }}>{post._count.comments}</span>
        </motion.button>

        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {currentUserId && post.authorId !== currentUserId && (
            <button
              onClick={() => setIsReporting(true)}
              title="Laporkan Post"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#FF4D4D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
              }}
            >
              <AlertTriangle size={20} />
            </button>
          )}
          <FeedBookmarkButton postId={post.id} initialBookmarked={false} />
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden", borderTop: "2px solid #000", background: "#fafafa" }}
          >
            <FeedCommentSection postId={post.id} currentUserId={currentUserId} />
          </motion.div>
        )}
      </AnimatePresence>

      {isReporting && (
        <ReportPostModal
          postId={post.id}
          onClose={() => setIsReporting(false)}
        />
      )}
    </motion.div>
  );
}
