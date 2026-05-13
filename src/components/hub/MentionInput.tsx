"use client";

import { useState, useRef, useEffect, useCallback } from "react";

type Member = {
  id: string;
  userId: string;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: string | null;
  user: { id: string; name: string; username: string; image: string | null };
};

type OnlineStatus = { [userId: string]: "online" | "away" | "offline" };

type MentionChip = {
  userId: string;
  displayName: string;
};

type Props = {
  members: Member[];
  onlineStatus: OnlineStatus;
  onSend: (content: string, mentions: string[]) => void;
  disabled?: boolean;
  disabledReason?: string;
  currentUserId: string;
};

export function MentionInput({ members, onlineStatus, onSend, disabled, disabledReason, currentUserId }: Props) {
  const [value, setValue] = useState("");
  const [mentionChips, setMentionChips] = useState<MentionChip[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const getDisplayName = (m: Member) => {
    if (m.isAnonymous && !m.revealedAt) return `Anon#${m.anonymousTag || "0000"}`;
    return m.user.username || m.user.name.toLowerCase().replace(/\s+/g, "");
  };

  const filteredMembers = members
    .filter((m) => m.userId !== currentUserId)
    .filter((m) => mentionQuery ? getDisplayName(m).toLowerCase().includes(mentionQuery.toLowerCase()) : true)
    .sort((a, b) => {
      const aOnline = onlineStatus[a.userId] === "online" ? -1 : 0;
      const bOnline = onlineStatus[b.userId] === "online" ? -1 : 0;
      return aOnline - bOnline;
    });

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setValue(v);

    // Detect @ trigger
    const lastAt = v.lastIndexOf("@");
    if (lastAt !== -1) {
      const afterAt = v.slice(lastAt + 1);
      if (!afterAt.includes(" ")) {
        setMentionQuery(afterAt);
        setDropdownOpen(true);
        return;
      }
    }
    setDropdownOpen(false);
    setMentionQuery(null);
  }

  function pickMention(member: Member) {
    const displayName = getDisplayName(member);
    const lastAt = value.lastIndexOf("@");
    const beforeAt = value.slice(0, lastAt);
    setValue(beforeAt + `@${displayName} `);
    setMentionChips((prev) => {
      if (prev.find((c) => c.userId === member.userId)) return prev;
      return [...prev, { userId: member.userId, displayName }];
    });
    setDropdownOpen(false);
    setMentionQuery(null);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  }

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    // Collect only mentioned userIds that appear in message
    const mentionedIds = mentionChips
      .filter((c) => trimmed.includes(`@${c.displayName}`))
      .map((c) => c.userId);
    onSend(trimmed, mentionedIds);
    setValue("");
    setMentionChips([]);
  }

  return (
    <div style={{ borderTop: "3px solid #000000", background: "#F5F0E8", padding: "12px 16px", zIndex: 50 }}>
      {/* Mention chips preview */}
      {mentionChips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
          {mentionChips.map((chip) => (
            <span
              key={chip.userId}
              style={{
                background: "#0047FF",
                color: "#fff",
                border: "2px solid #000000",
                boxShadow: "2px 2px 0px #000000",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 800,
                padding: "2px 10px",
                fontFamily: "Space Grotesk, sans-serif",
              }}
            >
              @{chip.displayName}
            </span>
          ))}
        </div>
      )}

      <div style={{ position: "relative" }}>
        {/* @mention dropdown */}
        {dropdownOpen && filteredMembers.length > 0 && (
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "#FFFFFF",
            border: "3px solid #000000",
            boxShadow: "4px 4px 0px #000000",
            borderRadius: "8px",
            maxHeight: "200px",
            overflowY: "auto",
            zIndex: 100,
          }}>
            <div style={{ padding: "8px", fontSize: "11px", color: "#000000", fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, borderBottom: "2px solid #000000", letterSpacing: "0.5px" }}>
              ANGGOTA PROJECT
            </div>
            {filteredMembers.map((m) => {
              const name = getDisplayName(m);
              const isOnline = onlineStatus[m.userId] === "online";
              return (
                <button
                  key={m.userId}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); pickMention(m); }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#E8E3DA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#F5F0E8", border: `2px solid ${isOnline ? "#00D37F" : "#000000"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "12px", fontWeight: 800, color: "#000000", flexShrink: 0,
                  }}>
                    {name[0]}
                  </div>
                  <div>
                    <div style={{ color: "#000000", fontSize: "13px", fontWeight: 800, fontFamily: "Space Grotesk, sans-serif" }}>
                      {m.user.name} <span style={{ fontSize: "11px", opacity: 0.6 }}>@{m.user.username}</span>
                    </div>
                    <div style={{ color: isOnline ? "#00D37F" : "#3D3D3D", fontSize: "11px", fontWeight: 600 }}>{isOnline ? "● Online" : "○ Offline"}</div>
                  </div>
                </button>
              );
            })}

            {/* @all support */}
            {(!mentionQuery || "all".includes(mentionQuery.toLowerCase()) || "semua".includes(mentionQuery.toLowerCase())) && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const lastAt = value.lastIndexOf("@");
                  const beforeAt = value.slice(0, lastAt);
                  setValue(beforeAt + "@all ");
                  setMentionChips((prev) => {
                    if (prev.find((c) => c.userId === "all")) return prev;
                    return [...prev, { userId: "all", displayName: "all" }];
                  });
                  setDropdownOpen(false);
                  setMentionQuery(null);
                  inputRef.current?.focus();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "#FFE500",
                  border: "none",
                  borderTop: "2px solid #000",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  background: "#fff", border: "2px solid #000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "14px", fontWeight: 900,
                }}>
                  📢
                </div>
                <div>
                  <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px", color: "#000" }}>@all</div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#000", opacity: 0.7 }}>TAG SEMUA ANGGOTA</div>
                </div>
              </button>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            ref={inputRef}
            type="text"
            id="hub-chat-input"
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? disabledReason : "Ketik pesan... (@ untuk mention)"}
            style={{
              flex: 1,
              background: disabled ? "#E8E3DA" : "#FFFFFF",
              border: "2px solid #000000",
              boxShadow: "2px 2px 0px #000000",
              borderRadius: "6px",
              padding: "10px 14px",
              color: disabled ? "#555" : "#000000",
              fontSize: "14px",
              fontWeight: 500,
              outline: "none",
              cursor: disabled ? "not-allowed" : "text",
              fontFamily: "Inter, sans-serif",
            }}
          />
          <button
            type="button"
            id="hub-chat-send-btn"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            style={{
              background: "#FFE500",
              border: "2px solid #000000",
              boxShadow: disabled || !value.trim() ? "none" : "2px 2px 0px #000000",
              borderRadius: "6px",
              padding: "10px 20px",
              fontFamily: "Space Grotesk, sans-serif",
              fontWeight: 800,
              fontSize: "14px",
              cursor: disabled || !value.trim() ? "not-allowed" : "pointer",
              color: "#000",
              opacity: disabled || !value.trim() ? 0.6 : 1,
              transform: disabled || !value.trim() ? "translate(2px, 2px)" : "none",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
}
