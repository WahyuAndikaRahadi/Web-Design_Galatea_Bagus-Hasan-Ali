"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FeedPostCard } from "./FeedPostCard";
import { ContributionPostForm } from "./ContributionPostForm";
import { EventPostForm } from "./EventPostForm";

interface Props {
  user: any;
}

export function FeedPage({ user }: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{ type?: string; sdg?: string }>({});
  const [showContribForm, setShowContribForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostElementRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && nextCursor) {
        fetchPosts(nextCursor);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, nextCursor]);

  const fetchPosts = async (cursor: string | null = null, reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (filter.type) params.set("type", filter.type);
      if (filter.sdg) params.set("sdg", filter.sdg);

      const res = await fetch(`/api/feed?${params.toString()}`);
      const data = await res.json();

      if (data.posts) {
        setPosts(prev => reset ? data.posts : [...prev, ...data.posts]);
        setNextCursor(data.nextCursor);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(null, true);
  }, [filter]);

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>
      {/* Create Post Header */}
      {user && user.trustScore >= 20 && (
        <div style={{
          background: "#FFE500",
          border: "3px solid #000",
          borderRadius: "8px",
          padding: "20px",
          marginBottom: "32px",
          boxShadow: "6px 6px 0px #000"
        }}>
          <h2 style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "20px", marginBottom: "16px" }}>
            Apa yang ingin kamu bagikan?
          </h2>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => setShowContribForm(true)}
              style={{
                flex: 1,
                background: "#0047FF",
                color: "#fff",
                border: "2px solid #000",
                padding: "12px",
                borderRadius: "4px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "3px 3px 0px #000"
              }}
            >
              📢 Progress Project
            </button>
            <button
              onClick={() => setShowEventForm(true)}
              style={{
                flex: 1,
                background: "#00D37F",
                color: "#000",
                border: "2px solid #000",
                padding: "12px",
                borderRadius: "4px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "3px 3px 0px #000"
              }}
            >
              🏆 Info Event
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px", scrollbarWidth: "none" }}>
        {[
          { label: "Semua", value: {} },
          { label: "Contribution", value: { type: "CONTRIBUTION" } },
          { label: "Event", value: { type: "EVENT" } },
          { label: "SDG 8", value: { sdg: "SDG8" } },
          { label: "SDG 9", value: { sdg: "SDG9" } },
          { label: "SDG 12", value: { sdg: "SDG12" } },
        ].map((f) => {
          const isActive = JSON.stringify(filter) === JSON.stringify(f.value);
          return (
            <button
              key={f.label}
              onClick={() => setFilter(f.value)}
              style={{
                whiteSpace: "nowrap",
                padding: "6px 16px",
                background: isActive ? "#000" : "#fff",
                color: isActive ? "#FFE500" : "#000",
                border: "2px solid #000",
                borderRadius: "20px",
                fontWeight: 800,
                fontSize: "13px",
                cursor: "pointer",
                boxShadow: isActive ? "none" : "2px 2px 0px #000"
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Feed List */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {posts.map((post, index) => {
          if (posts.length === index + 1) {
            return (
              <div ref={lastPostElementRef} key={post.id}>
                <FeedPostCard post={post} currentUserId={user?.id} />
              </div>
            );
          }
          return <FeedPostCard key={post.id} post={post} currentUserId={user?.id} />;
        })}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "20px", fontWeight: 800 }}>Memuat konten...</div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "#F5F0E8", border: "2px dashed #000", borderRadius: "8px" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontWeight: 800, fontSize: "18px", color: "#000" }}>Belum ada konten yang cocok.</div>
          <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>Coba ganti filter atau bagikan sesuatu!</p>
        </div>
      )}

      {/* Modals */}
      <ContributionPostForm 
        isOpen={showContribForm} 
        onClose={() => setShowContribForm(false)} 
        onSuccess={() => fetchPosts(null, true)} 
      />
      <EventPostForm 
        isOpen={showEventForm} 
        onClose={() => setShowEventForm(false)} 
        onSuccess={() => fetchPosts(null, true)} 
        trustScore={user?.trustScore || 0}
      />
    </div>
  );
}
