"use client";

import { useState, useEffect, useRef } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { MentionInput } from "./MentionInput";
import { User } from "lucide-react";

type Member = {
  id: string;
  userId: string;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: string | null;
  role: string;
  user: { id: string; name: string; image: string | null };
};

type HubMessage = {
  id: string;
  content: string;
  createdAt: string;
  mentions: string[];
  sender: { id: string; name: string; image: string | null; isAnonymous?: boolean };
  status?: "pending" | "sent";
};

type OnlineStatus = { [userId: string]: "online" | "away" | "offline" };

type Props = {
  projectId: string;
  roomId: string;
  roomName: string;
  roomType: "ANNOUNCEMENT" | "GENERAL" | "KANBAN" | "CUSTOM";
  roomDescription: string | null;
  members: Member[];
  onlineStatus: OnlineStatus;
  currentUserId: string;
  currentMember: Member;
  activeTab?: "chat" | "kanban";
};

export function HubChat({ projectId, roomId, roomName, roomType, roomDescription, members, onlineStatus, currentUserId, currentMember, activeTab = "chat" }: Props) {
  const [messages, setMessages] = useState<HubMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isOwner = currentMember.role === "OWNER";
  const isAnnouncement = roomType === "ANNOUNCEMENT";
  const canSend = !isAnnouncement || isOwner;

  // Load messages
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetch(`/api/hub/${projectId}/rooms/${roomId}/messages`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, roomId]);

  // Pusher subscription
  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.hubRoom(roomId));
      channel.bind(EVENTS.HUB_MESSAGE, (msg: HubMessage) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, { ...msg, status: "sent" }];
        });
      });
    } catch {}
    return () => {
      try { pusher?.unsubscribe(CHANNELS.hubRoom(roomId)); } catch {}
    };
  }, [roomId]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(content: string, mentions: string[]) {
    // 1. Optimistic Update
    const pendingId = `pending-${Date.now()}`;
    const pendingMsg: HubMessage = {
      id: pendingId,
      content,
      createdAt: new Date().toISOString(),
      mentions,
      status: "pending",
      sender: {
        id: currentUserId,
        name: currentMember.isAnonymous ? `Anon#${currentMember.anonymousTag || "0000"}` : currentMember.user.name,
        image: currentMember.isAnonymous ? null : currentMember.user.image,
        isAnonymous: currentMember.isAnonymous
      }
    };

    setMessages((prev) => [...prev, pendingMsg]);

    // 2. Fetch API
    try {
      const res = await fetch(`/api/hub/${projectId}/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mentions }),
      });
      
      if (res.ok) {
        const savedMsg = await res.json();
        savedMsg.status = "sent";
        
        setMessages((prev) => {
          // If Pusher already broadcasted it before fetch completed, avoid duplicate
          if (prev.find(m => m.id === savedMsg.id)) {
            return prev.filter(m => m.id !== pendingId).map(m => m.id === savedMsg.id ? { ...m, status: "sent" } : m);
          }
          // Otherwise, replace the pending message with the real one
          return prev.map((m) => (m.id === pendingId ? savedMsg : m));
        });
      } else {
        // Rollback optimistic update on error
        setMessages((prev) => prev.filter((m) => m.id !== pendingId));
      }
    } catch {
      // Rollback on network error
      setMessages((prev) => prev.filter((m) => m.id !== pendingId));
    }
  }

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Hari Ini";
    if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
  };

  // Group messages by day
  const grouped: { date: string; messages: HubMessage[] }[] = [];
  for (const msg of messages) {
    const d = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === d) last.messages.push(msg);
    else grouped.push({ date: d, messages: [msg] });
  }

  function renderContent(content: string, myMessage: boolean) {
    // Get all possible display names for project members
    const possibleNames = members.map((m) => {
      if (m.isAnonymous && !m.revealedAt) return `Anon#${m.anonymousTag || "0000"}`;
      return m.user.name;
    });
    possibleNames.push("all");

    // Sort by length descending so we match "Kamen Raiding" before "Kamen"
    const sortedNames = [...possibleNames].sort((a, b) => b.length - a.length);
    
    // Escape special characters in names for use in regex
    const escapedNames = sortedNames.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    
    // Create regex that matches @ followed by any of the member names
    const mentionRegex = new RegExp(`(@(?:${escapedNames.join("|")}))`, "g");

    const parts = content.split(mentionRegex);
    return parts.map((part, i) => {
      // Check if this part is a valid mention from our list
      const isMention = part.startsWith("@") && possibleNames.some(n => `@${n}` === part);
      
      if (isMention) {
        return (
          <span key={i} style={{ color: "#0047FF", fontWeight: 900 }}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", overflow: "hidden" }}>
      {/* Room header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "3px solid #000000",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexShrink: 0,
        background: "#FFFFFF",
      }}>
        <div>
          <div style={{
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 900,
            fontSize: "18px",
            color: "#000000",
          }}>
            {roomType === "GENERAL" ? "💬" : roomType === "ANNOUNCEMENT" ? "📢" : "#"} {roomName}
          </div>
          {roomDescription && (
            <div style={{ fontSize: "12px", color: "#555", marginTop: "2px" }}>{roomDescription}</div>
          )}
        </div>
        {isAnnouncement && !isOwner && (
          <div style={{
            marginLeft: "auto",
            background: "#F5F0E8",
            border: "2px solid #000000",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "12px",
            color: "#000000",
            fontWeight: 800,
            fontFamily: "Space Grotesk, sans-serif",
            boxShadow: "2px 2px 0px #000",
          }}>
            📢 Read-only
          </div>
        )}
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#3D3D3D", padding: "40px", fontSize: "14px", fontWeight: 600 }}>Memuat pesan...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#3D3D3D", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              {roomType === "ANNOUNCEMENT" ? "📢" : "💬"}
            </div>
            <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "18px", color: "#000000", marginBottom: "6px" }}>
              Belum ada pesan di #{roomName}
            </div>
            <div style={{ fontSize: "14px", color: "#3D3D3D" }}>
              {isAnnouncement && !isOwner ? "Owner akan memposting pengumuman di sini." : "Jadilah yang pertama mengirim pesan!"}
            </div>
          </div>
        ) : (
          grouped.map(({ date, messages: dayMsgs }) => (
            <div key={date}>
              {/* Date separator */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "16px 0 12px" }}>
                <div style={{ flex: 1, height: "2px", background: "#000000" }} />
                <div style={{ color: "#000000", fontSize: "12px", fontWeight: 800, fontFamily: "Space Grotesk, sans-serif", letterSpacing: "0.5px", background: "#FFE500", border: "2px solid #000", padding: "2px 10px", borderRadius: "20px", boxShadow: "2px 2px 0px #000" }}>{date}</div>
                <div style={{ flex: 1, height: "2px", background: "#000000" }} />
              </div>

              {dayMsgs.map((msg, i) => {
                const isMe = msg.sender.id === currentUserId;
                const prevMsg = i > 0 ? dayMsgs[i - 1] : null;
                const sameAuthor = prevMsg && prevMsg.sender.id === msg.sender.id;

                return (
                  <div key={msg.id} id={`hub-msg-${msg.id}`} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: "10px", marginBottom: sameAuthor ? "2px" : "12px", alignItems: "flex-end" }}>
                    {/* Avatar */}
                    {!sameAuthor && (
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: isMe ? "#FFE500" : "#F5F0E8", border: "2px solid #000000",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", flexShrink: 0,
                      }}>
                        {msg.sender.isAnonymous ? (
                          <User size={18} />
                        ) : msg.sender.image ? (
                          <img src={msg.sender.image} alt={msg.sender.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <User size={18} strokeWidth={2.5} />
                        )}
                      </div>
                    )}
                    {sameAuthor && <div style={{ width: "32px", flexShrink: 0 }} />}

                    <div style={{ maxWidth: "65%" }}>
                      {!sameAuthor && !isMe && (
                        <div style={{ fontSize: "12px", color: "#3D3D3D", marginBottom: "4px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700 }}>
                          {msg.sender.name}
                        </div>
                      )}
                      <div style={{
                        background: isMe ? "#FFE500" : "#F5F0E8",
                        color: "#000000",
                        border: "2px solid #000000",
                        borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        padding: "8px 14px",
                        fontSize: "15px",
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                        boxShadow: isMe ? "-2px 2px 0px #000" : "2px 2px 0px #000",
                      }}>
                        {renderContent(msg.content, isMe)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#555", marginTop: "4px", textAlign: isMe ? "right" : "left", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: isMe ? "flex-end" : "flex-start", gap: "4px" }}>
                        {formatTime(msg.createdAt)}
                        {isMe && msg.status === "pending" && <span style={{ color: "#888", fontSize: "12px", marginLeft: "2px" }} title="Mengirim...">🕒</span>}
                        {isMe && (msg.status === "sent" || !msg.status) && <span style={{ color: "#00D37F", fontWeight: 900, fontSize: "12px", marginLeft: "2px" }} title="Terkirim">✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <MentionInput
        members={members}
        onlineStatus={onlineStatus}
        onSend={handleSend}
        disabled={!canSend}
        disabledReason="Hanya owner yang bisa mengirim di #announcement"
        currentUserId={currentUserId}
      />
    </div>
  );
}
