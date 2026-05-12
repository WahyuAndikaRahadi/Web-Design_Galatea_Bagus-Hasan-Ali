"use client";

import { useEffect, useState } from "react";
import { getPusherClient, CHANNELS } from "@/lib/pusher";
import { User, AlertTriangle } from "lucide-react";
import { ReportMemberModal } from "./ReportMemberModal";

type Member = {
  userId: string;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: string | null;
  user: { id: string; name: string; image: string | null };
};

type PresenceData = {
  [userId: string]: { name: string; image: string | null };
};

type Props = {
  projectId: string;
  members: Member[];
  currentUserId: string;
  onStatusChange?: (status: { [userId: string]: "online" | "away" | "offline" }) => void;
};

export function PresencePanel({ projectId, members, currentUserId, onStatusChange }: Props) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceData>({});
  const [reportingMember, setReportingMember] = useState<Member | null>(null);

  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.hubPresence(projectId)) as ReturnType<typeof pusher.subscribe> & {
        members: {
          each: (fn: (member: { id: string; info: { name: string; image: string | null } }) => void) => void;
        };
      };

      channel.bind("pusher:subscription_succeeded", () => {
        const online: PresenceData = {};
        // @ts-ignore — presence channel members API
        channel.members.each((member: { id: string; info: { name: string; image: string | null } }) => {
          online[member.id] = member.info;
        });
        setOnlineUsers(online);
        updateStatus(online);
      });

      channel.bind("pusher:member_added", (member: { id: string; info: { name: string; image: string | null } }) => {
        setOnlineUsers((prev) => {
          const next = { ...prev, [member.id]: member.info };
          updateStatus(next);
          return next;
        });
      });

      channel.bind("pusher:member_removed", (member: { id: string }) => {
        setOnlineUsers((prev) => {
          const next = { ...prev };
          delete next[member.id];
          updateStatus(next);
          return next;
        });
      });
    } catch {}

    return () => {
      try { pusher?.unsubscribe(CHANNELS.hubPresence(projectId)); } catch {}
    };
  }, [projectId]);

  function updateStatus(online: PresenceData) {
    const status: { [userId: string]: "online" | "away" | "offline" } = {};
    for (const m of members) {
      status[m.userId] = online[m.userId] ? "online" : "offline";
    }
    onStatusChange?.(status);
  }

  const getDisplayName = (m: Member) => {
    if (m.isAnonymous && !m.revealedAt) return `Anon#${m.anonymousTag || "0000"}`;
    return m.user.name;
  };

  const onlineList = members.filter((m) => onlineUsers[m.userId]);
  const offlineList = members.filter((m) => !onlineUsers[m.userId]);

  function MemberRow({ m, isOnline }: { m: Member; isOnline: boolean }) {
    const name = getDisplayName(m);
    const isMe = m.userId === currentUserId;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 4px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: isMe ? "#FFE500" : "#FFFFFF",
            border: `2px solid ${isOnline ? "#00D37F" : "#000000"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            fontSize: "12px", fontWeight: 800,
            color: "#000000",
          }}>
            {m.isAnonymous && !m.revealedAt ? (
              <User size={16} />
            ) : m.user.image ? (
              <img src={m.user.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={16} strokeWidth={3} />
            )}
          </div>
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            width: "8px", height: "8px", borderRadius: "50%",
            background: isOnline ? "#00D37F" : "#A0A0A0",
            border: "1.5px solid #000000",
          }} />
        </div>
        <span style={{
          color: isOnline ? "#000000" : "#3D3D3D",
          fontSize: "12px",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: isMe ? 800 : 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {name}{isMe && " (kamu)"}
        </span>
        
        {!isMe && (
          <button
            onClick={() => setReportingMember(m)}
            title="Laporkan Anggota"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#FF4D4D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "2px",
            }}
          >
            <AlertTriangle size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width: "240px", // Increased for better mobile feel
      background: "#F5F0E8",
      borderLeft: "3px solid #000000",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      height: "100%", // Full height for mobile drawer
    }}>
      <div style={{ padding: "14px 12px 10px", borderBottom: "3px solid #000000", background: "#FFE500" }}>
        <div style={{
          fontSize: "11px",
          color: "#000000",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 800,
          letterSpacing: "1px",
          textTransform: "uppercase",
        }}>
          Anggota — {members.length}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {/* Online section */}
        {onlineList.length > 0 && (
          <div style={{ marginBottom: "12px" }}>
            <div style={{
              fontSize: "11px", color: "#000000",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800, letterSpacing: "0.5px",
              marginBottom: "4px", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "4px"
            }}>
              <span style={{ color: "#00D37F" }}>●</span> Online — {onlineList.length}
            </div>
            {onlineList.map((m) => (
              <MemberRow key={m.userId} m={m} isOnline={true} />
            ))}
          </div>
        )}

        {/* Offline section */}
        {offlineList.length > 0 && (
          <div>
            <div style={{
              fontSize: "11px", color: "#3D3D3D",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800, letterSpacing: "0.5px",
              marginBottom: "4px", textTransform: "uppercase",
            }}>
              ○ Offline — {offlineList.length}
            </div>
            {offlineList.map((m) => (
              <MemberRow key={m.userId} m={m} isOnline={false} />
            ))}
          </div>
        )}
      </div>

      {reportingMember && (
        <ReportMemberModal
          projectId={projectId}
          reportedId={reportingMember.userId}
          reportedName={getDisplayName(reportingMember)}
          onClose={() => setReportingMember(null)}
        />
      )}
    </div>
  );
}
