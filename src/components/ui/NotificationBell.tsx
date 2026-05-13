"use client";

import { useState, useEffect, useRef } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  invitationId: string | null;
  createdAt: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      console.log(`[Pusher] Fetching notifications for user: ${userId}`);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        console.log(`[Pusher] Fetched ${data?.length} notifications`);
        if (Array.isArray(data)) setNotifications(data);
      }
    } catch (err) {
      console.error("[Pusher] Fetch error", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Pusher real-time updates
  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      console.log(`[Pusher] Subscribing to private-user-${userId}`);
      const channel = pusher.subscribe(CHANNELS.user(userId));
      channel.bind(EVENTS.NEW_NOTIFICATION, (data: any) => {
        console.log("[Pusher] Received NEW_NOTIFICATION", data);
        fetchNotifications();
      });
    } catch (err) {
      console.error("[Pusher] Subscription error", err);
    }
    
    return () => {
      try { pusher?.unsubscribe(CHANNELS.user(userId)); } catch {}
    };
  }, [userId]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string, link: string | null) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    }).catch(() => {});
    
    setIsOpen(false);
    if (link) router.push(link);
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    }).catch(() => {});
  };

  const handleInvitation = async (e: React.MouseEvent, id: string, invitationId: string, action: "ACCEPT" | "DECLINE") => {
    e.stopPropagation(); // Prevent marking as read and navigating
    
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    
    try {
      const res = await fetch(`/api/invitations/${invitationId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      if (!res.ok) {
        // Rollback if needed, but for now we just show error
        console.error("Failed to respond to invitation");
      } else {
        // Refresh notifications to reflect state
        fetchNotifications();
        if (action === "ACCEPT") {
          router.refresh();
        }
      }
    } catch (err) {
      console.error("Invitation response error", err);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "24px",
          position: "relative",
          padding: "4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              background: "#FF4D4D",
              color: "#fff",
              fontSize: "10px",
              fontWeight: 800,
              fontFamily: "Space Grotesk, sans-serif",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #000",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "120%",
            right: 0,
            width: "320px",
            background: "#fff",
            border: "3px solid #000",
            borderRadius: "8px",
            boxShadow: "6px 6px 0px #000",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            maxHeight: "400px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "2px solid #000", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F5F0E8" }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "15px" }}>Notifikasi</span>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                style={{ background: "transparent", border: "none", color: "#0047FF", fontSize: "12px", fontWeight: 700, cursor: "pointer", padding: 0 }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
          
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#666", fontSize: "13px" }}>
                Tidak ada notifikasi baru.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id, n.link)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                    background: n.isRead ? "#fff" : "#FFFBE5",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = n.isRead ? "#F5F0E8" : "#FFF0B3"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? "#fff" : "#FFFBE5"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px", color: n.isRead ? "#333" : "#000" }}>
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#FF4D4D", flexShrink: 0, marginTop: "4px" }} />
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "#3D3D3D", lineHeight: 1.4, marginBottom: "4px" }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: "10px", color: "#999", marginBottom: n.type === "INVITATION" && !n.isRead ? "12px" : "0" }}>
                    {new Date(n.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>

                  {n.type === "INVITATION" && !n.isRead && n.invitationId && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleInvitation(e, n.id, n.invitationId!, "ACCEPT")}
                        style={{
                          flex: 1,
                          background: "#00D37F",
                          border: "2px solid #000",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "6px",
                          cursor: "pointer",
                          fontFamily: "Space Grotesk, sans-serif",
                          boxShadow: "2px 2px 0px #000"
                        }}
                      >
                        Terima
                      </button>
                      <button
                        onClick={(e) => handleInvitation(e, n.id, n.invitationId!, "DECLINE")}
                        style={{
                          flex: 1,
                          background: "#FF4D4D",
                          border: "2px solid #000",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "6px",
                          cursor: "pointer",
                          color: "#fff",
                          fontFamily: "Space Grotesk, sans-serif",
                          boxShadow: "2px 2px 0px #000"
                        }}
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
