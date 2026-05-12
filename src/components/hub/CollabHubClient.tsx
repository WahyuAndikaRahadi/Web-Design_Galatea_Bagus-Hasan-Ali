"use client";

import { useState, useEffect, useCallback } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { RoomSidebar } from "./RoomSidebar";
import { HubChat } from "./HubChat";
import { HubKanban } from "./HubKanban";
import { PresencePanel } from "./PresencePanel";
import { CreateRoomModal } from "./CreateRoomModal";
import { PasswordModal } from "./PasswordModal";
import { ProjectSettingsModal } from "./ProjectSettingsModal";
import { ManageMembersModal } from "./ManageMembersModal";

// ─── Types ────────────────────────────────────────────────────────────────────

type HubRoom = {
  id: string;
  name: string;
  description: string | null;
  type: "ANNOUNCEMENT" | "GENERAL" | "KANBAN" | "CUSTOM";
  isPrivate: boolean;
  createdAt: string;
};

type Member = {
  id: string;
  userId: string;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: string | null;
  role: string;
  user: { id: string; name: string; image: string | null; trustScore: number; trustLevel: string };
};

type Project = {
  id: string;
  title: string;
  description: string;
  members: Member[];
  hubRooms: HubRoom[];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function CollabHubClient({
  project: initialProject,
  currentUserId,
  isOwner,
  currentMember,
  initialRoomId,
}: {
  project: Project;
  currentUserId: string;
  isOwner: boolean;
  currentMember: Member;
  initialRoomId?: string;
}) {
  const [rooms, setRooms] = useState<HubRoom[]>(initialProject.hubRooms);
  const [projectInfo, setProjectInfo] = useState({ title: initialProject.title, description: initialProject.description });
  const [activeRoom, setActiveRoom] = useState<HubRoom | null>(null);
  const [customTab, setCustomTab] = useState<"chat" | "kanban">("chat");
  const [unlockedRooms, setUnlockedRooms] = useState<Set<string>>(new Set());
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [passwordRoom, setPasswordRoom] = useState<HubRoom | null>(null);
  const [onlineStatus, setOnlineStatus] = useState<{ [userId: string]: "online" | "away" | "offline" }>({});
  const [unreadStatus, setUnreadStatus] = useState<Record<string, "message" | "mention" | null>>({});

  // Mobile responsiveness states
  const [mobileSidebar, setMobileSidebar] = useState<"left" | "right" | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isAdmin = currentMember.role === "ADMIN";
  const canManageProject = isOwner || isAdmin;

  // Select initial room
  useEffect(() => {
    if (rooms.length === 0) return;
    if (initialRoomId) {
      const found = rooms.find((r) => r.id === initialRoomId);
      if (found) { handleSelectRoom(found); return; }
    }
    // Default: #general
    const general = rooms.find((r) => r.type === "GENERAL");
    if (general) handleSelectRoom(general);
    else setActiveRoom(rooms[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for new rooms via Pusher
  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.hub(initialProject.id));
      channel.bind(EVENTS.HUB_ROOM_CREATED, (room: HubRoom) => {
        setRooms((prev) => {
          if (prev.find((r) => r.id === room.id)) return prev;
          return [...prev, room];
        });
      });
    } catch {}
    return () => {
      try { pusher?.unsubscribe(CHANNELS.hub(initialProject.id)); } catch {}
    };
  }, [initialProject.id]);

  // Listen for room messages for notifications
  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.hub(initialProject.id));
      channel.bind("room-message", (data: { roomId: string; mentions: string[] }) => {
        // If not in this room, mark as unread
        if (activeRoom?.id !== data.roomId) {
          const isMention = data.mentions.includes(currentUserId) || data.mentions.includes("all");
          setUnreadStatus((prev) => ({
            ...prev,
            [data.roomId]: isMention ? "mention" : "message",
          }));
        }
      });
    } catch {}
    return () => {
      try { pusher?.unsubscribe(CHANNELS.hub(initialProject.id)); } catch {}
    };
  }, [initialProject.id, activeRoom?.id, currentUserId]);

  function handleSelectRoom(room: HubRoom) {
    if (room.isPrivate && !unlockedRooms.has(room.id) && !isOwner) {
      setPasswordRoom(room);
      return;
    }
    setActiveRoom(room);
    setCustomTab("chat");
    // Clear unread status when entering a room
    setUnreadStatus((prev) => ({ ...prev, [room.id]: null }));
    // Close sidebar on mobile after selecting
    if (isMobile) setMobileSidebar(null);
  }

  function handlePasswordSuccess() {
    if (!passwordRoom) return;
    setUnlockedRooms((prev) => new Set([...prev, passwordRoom.id]));
    setActiveRoom(passwordRoom);
    setPasswordRoom(null);
    setCustomTab("chat");
  }

  function handleRoomCreated(room: HubRoom) {
    setRooms((prev) => [...prev, room]);
    setActiveRoom(room);
    setCustomTab("chat");
  }

  const isKanbanRoom = activeRoom?.type === "KANBAN";
  const isCustomRoom = activeRoom?.type === "CUSTOM";
  const showKanban = isKanbanRoom || (isCustomRoom && customTab === "kanban");
  const showChat = !isKanbanRoom && (!isCustomRoom || customTab === "chat");

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      flex: 1, 
      overflow: "hidden", 
      height: "100%",
      position: "relative" 
    }}>
      {/* ─── Mobile Header ─── */}
      {isMobile && (
        <div style={{
          height: "56px",
          background: "#FFFFFF",
          borderBottom: "3px solid #000000",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          flexShrink: 0,
          zIndex: 40
        }}>
          <button 
            onClick={() => setMobileSidebar(mobileSidebar === "left" ? null : "left")}
            style={{
              background: "#FFE500",
              border: "2px solid #000000",
              borderRadius: "4px",
              padding: "4px 8px",
              fontWeight: 900,
              boxShadow: "2px 2px 0px #000"
            }}
          >
            ☰
          </button>
          
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, textAlign: "center", margin: "0 12px" }}>
            {activeRoom ? `# ${activeRoom.name}` : projectInfo.title}
          </div>

          <button 
            onClick={() => setMobileSidebar(mobileSidebar === "right" ? null : "right")}
            style={{
              background: "#00D37F",
              border: "2px solid #000000",
              borderRadius: "4px",
              padding: "4px 8px",
              fontWeight: 900,
              boxShadow: "2px 2px 0px #000"
            }}
          >
            👥
          </button>
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* ─── Left: Room Sidebar ─── */}
        <div style={{
          position: isMobile ? "absolute" : "relative",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: isMobile ? (mobileSidebar === "left" ? "translateX(0)" : "translateX(-100%)") : "none",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex"
        }}>
          <RoomSidebar
            rooms={rooms}
            activeRoomId={activeRoom?.id ?? null}
            onSelectRoom={handleSelectRoom}
            onCreateRoom={() => setShowCreateRoom(true)}
            isOwner={isOwner}
            isAdmin={isAdmin}
            projectTitle={projectInfo.title}
            unlockedRooms={unlockedRooms}
            unreadStatus={unreadStatus}
            onOpenSettings={() => setShowSettings(true)}
            onManageMembers={() => setShowManageMembers(true)}
          />
        </div>

        {/* Backdrop for mobile */}
        {isMobile && mobileSidebar && (
          <div 
            onClick={() => setMobileSidebar(null)}
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 45,
              backdropFilter: "blur(2px)"
            }}
          />
        )}

      {/* ─── Center: Main Content ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {activeRoom ? (
          <>
            {/* Custom room: tab switcher (Chat / Kanban) */}
            {isCustomRoom && (
              <div style={{ background: "#FFFFFF", borderBottom: "3px solid #000000", display: "flex", flexShrink: 0 }}>
                {(["chat", "kanban"] as const).map((tab) => (
                  <button
                    key={tab}
                    id={`hub-custom-tab-${tab}`}
                    onClick={() => setCustomTab(tab)}
                    style={{
                      padding: "12px 20px",
                      background: customTab === tab ? "#FFE500" : "#FFFFFF",
                      color: customTab === tab ? "#000000" : "#3D3D3D",
                      border: "none",
                      borderRight: "3px solid #000000",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab === "chat" ? "💬 Chat" : "📋 Kanban"}
                  </button>
                ))}
              </div>
            )}

            {/* Chat */}
            {showChat && (
              <HubChat
                key={`chat-${activeRoom.id}`}
                projectId={initialProject.id}
                roomId={activeRoom.id}
                roomName={activeRoom.name}
                roomType={activeRoom.type}
                roomDescription={activeRoom.description}
                members={initialProject.members}
                onlineStatus={onlineStatus}
                currentUserId={currentUserId}
                currentMember={currentMember}
              />
            )}

            {/* Kanban */}
            {showKanban && (
              <HubKanban
                key={`kanban-${activeRoom.id}`}
                projectId={initialProject.id}
                roomId={isCustomRoom ? activeRoom.id : undefined}
                members={initialProject.members}
                currentUserId={currentUserId}
                isGlobal={isKanbanRoom}
              />
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF" }}>
            <div style={{ textAlign: "center", color: "#3D3D3D" }}>
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                <img src="/images/logo.png" alt="Logo" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
              </div>
              <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "18px", color: "#000000" }}>
                Pilih room dari sidebar
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Right: Presence Panel ─── */}
      <div style={{
        position: isMobile ? "absolute" : "relative",
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        transform: isMobile ? (mobileSidebar === "right" ? "translateX(0)" : "translateX(100%)") : "none",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex"
      }}>
        <PresencePanel
          projectId={initialProject.id}
          members={initialProject.members}
          currentUserId={currentUserId}
          onStatusChange={setOnlineStatus}
        />
      </div>
    </div>

      {/* ─── Modals ─── */}
      {showCreateRoom && (
        <CreateRoomModal
          projectId={initialProject.id}
          onCreated={handleRoomCreated}
          onClose={() => setShowCreateRoom(false)}
        />
      )}
      {passwordRoom && (
        <PasswordModal
          projectId={initialProject.id}
          roomId={passwordRoom.id}
          roomName={passwordRoom.name}
          onSuccess={handlePasswordSuccess}
          onClose={() => setPasswordRoom(null)}
        />
      )}
      {showSettings && (
        <ProjectSettingsModal
          projectId={initialProject.id}
          initialTitle={projectInfo.title}
          initialDescription={projectInfo.description}
          onClose={() => setShowSettings(false)}
          onUpdated={(title, description) => setProjectInfo({ title, description })}
        />
      )}
      {showManageMembers && (
        <ManageMembersModal
          projectId={initialProject.id}
          members={initialProject.members}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isOwner={isOwner}
          onClose={() => setShowManageMembers(false)}
        />
      )}
    </div>
  );
}
