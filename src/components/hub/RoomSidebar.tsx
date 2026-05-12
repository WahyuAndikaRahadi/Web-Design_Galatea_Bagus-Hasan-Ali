"use client";

type HubRoomDef = {
  id: string;
  name: string;
  description: string | null;
  type: "ANNOUNCEMENT" | "GENERAL" | "KANBAN" | "CUSTOM";
  isPrivate: boolean;
  createdAt: string;
};

type Props = {
  rooms: HubRoomDef[];
  activeRoomId: string | null;
  onSelectRoom: (room: HubRoomDef) => void;
  onCreateRoom: () => void;
  isOwner: boolean;
  isAdmin: boolean;
  projectTitle: string;
  unlockedRooms: Set<string>;
  unreadStatus: Record<string, "message" | "mention" | null>;
  onOpenSettings?: () => void;
  onManageMembers?: () => void;
};

const ROOM_ICON: Record<HubRoomDef["type"], string> = {
  ANNOUNCEMENT: "📢",
  GENERAL: "💬",
  KANBAN: "📋",
  CUSTOM: "#",
};

export function RoomSidebar({ rooms, activeRoomId, onSelectRoom, onCreateRoom, isOwner, isAdmin, projectTitle, unlockedRooms, unreadStatus, onOpenSettings, onManageMembers }: Props) {
  const defaultRooms = rooms.filter((r) => r.type !== "CUSTOM");
  const customRooms = rooms.filter((r) => r.type === "CUSTOM");

  function renderRoom(room: HubRoomDef) {
    const isActive = activeRoomId === room.id;
    const locked = room.isPrivate && !unlockedRooms.has(room.id);
    const icon = ROOM_ICON[room.type];

    return (
      <button
        key={room.id}
        id={`hub-room-btn-${room.id}`}
        onClick={() => onSelectRoom(room)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 12px",
          background: isActive ? "#FFE500" : "transparent",
          border: isActive ? "2px solid #000000" : "2px solid transparent",
          boxShadow: isActive ? "2px 2px 0px #000000" : "none",
          borderRadius: "6px",
          cursor: "pointer",
          textAlign: "left",
          transition: "all 0.15s ease",
          marginBottom: "2px",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#E8E3DA"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        <span style={{ fontSize: room.type === "CUSTOM" ? "12px" : "16px", flexShrink: 0, color: isActive ? "#000" : "#3D3D3D", fontFamily: "Space Grotesk, sans-serif", fontWeight: 800 }}>
          {icon}
        </span>
        <span style={{
          flex: 1,
          color: isActive ? "#000000" : "#3D3D3D",
          fontSize: "13px",
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: isActive ? 800 : 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {room.type === "CUSTOM" ? room.name : room.name}
        </span>
        {locked && (
          <span style={{ fontSize: "12px", color: isActive ? "#000000" : "#3D3D3D", flexShrink: 0 }}>🔒</span>
        )}
        
        {/* Notification Bubble */}
        {!isActive && unreadStatus[room.id] && (
          <div style={{
            background: unreadStatus[room.id] === "mention" ? "#0047FF" : "#FF4D4D",
            color: "#FFFFFF",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: 900,
            border: "2px solid #000000",
            boxShadow: "1px 1px 0px #000000",
            flexShrink: 0,
            animation: "bounce 0.5s infinite alternate",
          }}>
            {unreadStatus[room.id] === "mention" ? "@" : "!"}
          </div>
        )}
      </button>
    );
  }

  return (
    <div style={{
      width: "280px", // Increased slightly for better mobile feel
      background: "#F5F0E8",
      borderRight: "3px solid #000000",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      overflow: "hidden",
      height: "100%", // Ensure full height in mobile drawer
    }}>
      {/* Project title header */}
      <div style={{
        padding: "16px 16px 12px",
        borderBottom: "3px solid #000000",
        flexShrink: 0,
        background: "#00D37F",
        position: "relative"
      }}>
        <div style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 900,
          fontSize: "14px",
          color: "#000000",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginBottom: "4px",
          paddingRight: (isOwner || isAdmin) ? "24px" : "0"
        }}>
          {projectTitle}
        </div>
        <div style={{ fontSize: "11px", color: "#000000", fontWeight: 800, letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
          <img src="/images/logo.png" alt="" style={{ width: "14px", height: "14px", objectFit: "contain" }} /> COLLAB HUB
        </div>

        {(isOwner || isAdmin) && (
          <div style={{ position: "absolute", top: "14px", right: "12px", display: "flex", gap: "6px" }}>
            <button
              onClick={onManageMembers}
              title="Kelola Anggota"
              style={{
                background: "#000000",
                color: "#FFE500",
                border: "none",
                borderRadius: "4px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "12px",
                boxShadow: "1.5px 1.5px 0px #000000"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
            >
              👥
            </button>
            <button
              onClick={onOpenSettings}
              title="Pengaturan Project"
              style={{
                background: "#000000",
                color: "#00D37F",
                border: "none",
                borderRadius: "4px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "12px",
                boxShadow: "1.5px 1.5px 0px #000000"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#000")}
            >
              ⚙️
            </button>
          </div>
        )}
      </div>

      {/* Rooms list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 8px" }}>
        {/* Default rooms section */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{
            fontSize: "11px",
            color: "#000000",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            padding: "4px 6px 8px",
          }}>
            Default
          </div>
          {defaultRooms.map(renderRoom)}
        </div>

        {/* Custom rooms section */}
        {(customRooms.length > 0 || isOwner) && (
          <div>
            <div style={{
              fontSize: "11px",
              color: "#000000",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              letterSpacing: "1px",
              textTransform: "uppercase",
              padding: "8px 6px 8px",
              borderTop: "2px solid #000000",
              marginTop: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>Rooms</span>
              {isOwner && (
                <button
                  id="hub-create-room-btn"
                  onClick={onCreateRoom}
                  title="Buat room baru"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#000000",
                    cursor: "pointer",
                    fontSize: "16px",
                    lineHeight: 1,
                    padding: "0 2px",
                    transition: "color 0.15s",
                    fontWeight: 900,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0047FF")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#000000")}
                >
                  +
                </button>
              )}
            </div>
            {customRooms.map(renderRoom)}
            {customRooms.length === 0 && isOwner && (
              <div style={{ padding: "8px 6px", color: "#666", fontSize: "12px", fontStyle: "italic", fontWeight: 600 }}>
                Belum ada room custom
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
