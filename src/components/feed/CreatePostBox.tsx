"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TOPIC_META, CATEGORY_META } from "@/types";

// Dynamic tags from metadata + general tags - deduplicated with Set
const PREDEFINED_TAGS = Array.from(new Set([
  ...Object.values(TOPIC_META).map(m => m.label),
  ...Object.values(CATEGORY_META).map(m => m.label),
  "Frontend", "Backend", "Design", "Research", "Business", "Marketing", "Writing", 
  "Engineering", "Management", "Education", "Agrotech", "Finance", "Creative"
]));

interface Props {
  user: any;
  onSuccess: () => void;
}

export function CreatePostBox({ user, onSuccess }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [type, setType] = useState<"CONTRIBUTION" | "EVENT" | null>(null);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState("LOMBA");
  const [eventDeadline, setEventDeadline] = useState("");
  const [eventLink, setEventLink] = useState("");

  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTagSearch, setActiveTagSearch] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [mentionedUsers, setMentionedUsers] = useState<{ id: string; name: string }[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [activeTrigger, setActiveTrigger] = useState<"#" | "@" | null>(null);

  // Corrected Project Fetch URL
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/users/me/projects?status=ACTIVE");
        const data = await res.json();
        if (Array.isArray(data)) setProjects(data);
      } catch (err) { console.error("Failed to fetch projects", err); }
    };
    if (user && user.trustScore >= 20) fetchProjects();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        if (!content && !selectedProjectId && !eventName) {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [content, selectedProjectId, eventName]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= 300) {
      setContent(val);
      checkTrigger(e.target);
    }
  };

  const checkTrigger = (target: HTMLTextAreaElement) => {
    const pos = target.selectionStart;
    const textBeforeCursor = target.value.slice(0, pos);

    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setCursorPosition(pos);
      setActiveTrigger("@");
      setShowSuggestions(false);
      setShowMentionSuggestions(true);
      return;
    }

    const hashMatch = textBeforeCursor.match(/#(\w*)$/);
    if (hashMatch) {
      setActiveTagSearch(hashMatch[1]);
      setCursorPosition(pos);
      setActiveTrigger("#");
      setShowMentionSuggestions(false);
      setShowSuggestions(true);
    } else {
      setActiveTrigger(null);
      setShowSuggestions(false);
      setShowMentionSuggestions(false);
    }
  };

  useEffect(() => {
    if (activeTrigger !== "@" || mentionSearch.length < 1) {
      setShowMentionSuggestions(false);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(mentionSearch)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMentionSuggestions(data);
          setShowMentionSuggestions(data.length > 0);
        }
      } catch { }
    }, 200);
    return () => clearTimeout(t);
  }, [mentionSearch, activeTrigger]);

  const handleTagSelect = (tag: string) => {
    if (cursorPosition === null || !textareaRef.current) return;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const newTextBeforeCursor = textBeforeCursor.replace(/#\w*$/, `#${tag} `);
    setContent(newTextBeforeCursor + textAfterCursor);
    setShowSuggestions(false);
    setActiveTrigger(null);
    textareaRef.current.focus();
  };

  const handleMentionSelect = (user: { id: string; name: string; username: string }) => {
    if (cursorPosition === null || !textareaRef.current) return;
    const textBeforeCursor = content.slice(0, cursorPosition);
    const textAfterCursor = content.slice(cursorPosition);
    const newTextBeforeCursor = textBeforeCursor.replace(/@\w*$/, `@${user.username} `);
    setContent(newTextBeforeCursor + textAfterCursor);
    setMentionedUsers((prev) => [...prev.filter((u) => u.id !== user.id), { id: user.id, name: user.name }]);
    setShowMentionSuggestions(false);
    setActiveTrigger(null);
    textareaRef.current.focus();
  };

  const highlightText = (text: string) => {
    if (!text) return null;
    // Highlight @username and #tag
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return <span key={i} style={{ color: "#00D37F", fontWeight: 800 }}>{part}</span>;
      }
      if (part.startsWith("#")) return <span key={i} style={{ color: "#0047FF", fontWeight: 800 }}>{part}</span>;
      return <span key={i} style={{ color: "#000" }}>{part}</span>;
    });
  };

  const extractTags = (text: string) => {
    const matches = text.match(/#\w+/g);
    return matches ? matches.map(t => t.slice(1)) : [];
  };

  const filteredTags = PREDEFINED_TAGS.filter(t => t.toLowerCase().includes(activeTagSearch.toLowerCase()));

  if (!user || user.trustScore < 20) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) return setError("Konten postingan wajib diisi.");
    if (type === "CONTRIBUTION" && !selectedProjectId) return setError("Pilih project terlebih dahulu jika memilih tipe Progress.");
    if (type === "EVENT" && (!eventName || !eventLink || !eventDeadline)) return setError("Mohon isi semua field wajib event.");
    if (type === "EVENT" && user.trustScore < 31) return setError("Butuh Trust Score 31+ untuk memposting event");

    setLoading(true);
    try {
      // If type is null, we default to CONTRIBUTION (General Post)
      const finalType = type || "CONTRIBUTION";

      const payload = finalType === "CONTRIBUTION"
        ? { type: finalType, projectId: selectedProjectId || null, content, mentions: mentionedUsers.map(u => u.id) }
        : { type: finalType, content, eventName, eventCategory, eventDeadline, eventLink, eventSkills: [], mentions: mentionedUsers.map(u => u.id) };

      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess();
        setContent("");
        setSelectedProjectId("");
        setEventName("");
        setEventLink("");
        setEventDeadline("");
        setMentionedUsers([]);
        setType(null);
        setIsExpanded(false);
      } else {
        const data = await res.json();
        setError(data.error || "Gagal memposting.");
      }
    } catch { setError("Terjadi kesalahan server."); } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      ref={boxRef}
      style={{
        background: "#FFFFFF",
        border: "3px solid #222",
        boxShadow: isExpanded ? "8px 8px 0px #222" : "4px 4px 0px #222",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        position: "relative",
        zIndex: 10,
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: "#FFE8E8", border: "2px solid #FF4D4D", padding: "10px 14px", borderRadius: "8px", color: "#FF4D4D", fontSize: "14px", fontWeight: 800 }}>
            <span>⚠️</span> {error}
          </motion.div>
        )}

        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "14px", border: "2px solid #222", background: "#FFE500", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "22px", flexShrink: 0, boxShadow: "3px 3px 0px #222" }}>
            {user.name?.[0] || "U"}
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            <div style={{ position: "relative", border: "3px solid #222", borderRadius: "12px", background: "#F5F0E8", transition: "all 0.2s", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, padding: "14px 18px", pointerEvents: "none", fontSize: "16px", lineHeight: "1.6", whiteSpace: "pre-wrap", color: "transparent", zIndex: 2 }}>
                {content ? highlightText(content) : <span style={{ color: "#888", opacity: 0.6, fontStyle: "italic" }}>Apa yang sedang kamu pelajari? Gunakan # atau @...</span>}
              </div>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyUp={(e) => checkTrigger(e.currentTarget)}
                onMouseUp={(e) => checkTrigger(e.currentTarget)}
                onFocus={() => setIsExpanded(true)}
                rows={isExpanded ? 4 : 1}
                style={{ width: "100%", padding: "14px 18px", background: "transparent", color: "transparent", fontSize: "16px", lineHeight: "1.6", resize: "none", outline: "none", caretColor: "#000", position: "relative", zIndex: 1 }}
              />
            </div>

            {isExpanded && (
              <div style={{ textAlign: "right", fontSize: "10px", fontWeight: 900, color: content.length > 250 ? "#FF4D4D" : "#888", marginTop: "4px" }}>
                {content.length} / 300
              </div>
            )}

            <AnimatePresence>
              {showSuggestions && filteredTags.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: "absolute", top: "100%", left: "0", marginTop: "12px", width: "260px", maxHeight: "220px", overflowY: "auto", zIndex: 20, padding: "8px", background: "#fff", border: "2px solid #222", boxShadow: "4px 4px 0px #222" }}>
                  {filteredTags.map((tag) => (
                    <button key={tag} type="button" onClick={() => handleTagSelect(tag)} style={{ width: "100%", padding: "8px", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontWeight: 800 }}>#{tag}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ position: "absolute", top: "100%", left: "0", marginTop: "12px", width: "260px", maxHeight: "220px", overflowY: "auto", zIndex: 21, padding: "8px", background: "#fff", border: "2px solid #222", boxShadow: "4px 4px 0px #222" }}>
                  {mentionSuggestions.map((user) => (
                    <button key={user.id} type="button" onMouseDown={() => handleMentionSelect(user)} style={{ width: "100%", padding: "8px", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", fontWeight: 700 }}>
                      <div style={{ fontWeight: 800 }}>@{user.username}</div>
                      <div style={{ fontSize: "11px", opacity: 0.6 }}>{user.name}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", paddingLeft: "68px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "12px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    type="button" 
                    onClick={() => setType(prev => prev === "CONTRIBUTION" ? null : "CONTRIBUTION")} 
                    style={{ 
                      padding: "10px 20px", 
                      background: type === "CONTRIBUTION" ? "#0047FF" : "#fff", 
                      color: type === "CONTRIBUTION" ? "#fff" : "#444", 
                      border: "2px solid #222", 
                      borderRadius: "12px", 
                      fontWeight: 900, 
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    📢 Progress
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setType(prev => prev === "EVENT" ? null : "EVENT")} 
                    style={{ 
                      padding: "10px 20px", 
                      background: type === "EVENT" ? "#00D37F" : "#fff", 
                      color: type === "EVENT" ? "#fff" : "#444", 
                      border: "2px solid #222", 
                      borderRadius: "12px", 
                      fontWeight: 900, 
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    🏆 Event
                  </button>
                </div>

                {type === "CONTRIBUTION" && (
                  <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} style={{ padding: "10px", background: "#F5F0E8", border: "2px solid #222", borderRadius: "8px", fontWeight: 700 }}>
                    <option value="">-- Pilih Project (Opsional) --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                )}

                {type === "EVENT" && (
                  <div style={{ display: "grid", gap: "12px", padding: "16px", background: "#F5F0E8", border: "2px solid #222", borderRadius: "12px" }}>
                    {user.trustScore < 31 ? <p style={{ color: "#FF4D4D", fontWeight: 800 }}>Butuh Trust Score 31+</p> : (
                      <>
                        <input type="text" placeholder="Nama Event" value={eventName} onChange={e => setEventName(e.target.value)} style={{ padding: "10px", border: "2px solid #222", borderRadius: "8px" }} />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                          <select value={eventCategory} onChange={e => setEventCategory(e.target.value)} style={{ padding: "10px", border: "2px solid #222", borderRadius: "8px" }}>
                            <option value="LOMBA">Lomba</option>
                            <option value="HACKATHON">Hackathon</option>
                            <option value="WORKSHOP">Workshop</option>
                            <option value="SEMINAR">Seminar</option>
                            <option value="LAINNYA">Lainnya</option>
                          </select>
                          <input type="date" value={eventDeadline} onChange={e => setEventDeadline(e.target.value)} style={{ padding: "10px", border: "2px solid #222", borderRadius: "8px" }} />
                        </div>
                        <input type="url" placeholder="Link Info/Daftar" value={eventLink} onChange={e => setEventLink(e.target.value)} style={{ padding: "10px", border: "2px solid #222", borderRadius: "8px" }} />
                      </>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px", borderTop: "2px solid #f0f0f0", paddingTop: "16px" }}>
                  <button
                    type="submit"
                    disabled={loading || (type === "EVENT" && user.trustScore < 31)}
                    style={{ 
                      padding: "12px 40px", 
                      background: "#FFE500",
                      border: "3px solid #222",
                      boxShadow: "4px 4px 0px #222",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    {loading ? (
                      <>
                        <svg width="24" height="24" viewBox="0 0 640 640" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"/>
                        </svg>
                        <span style={{ fontWeight: 900, color: "#222" }}>...</span>
                      </>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 640 640" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M568.4 37.7C578.2 34.2 589 36.7 596.4 44C603.8 51.3 606.2 62.2 602.7 72L424.7 568.9C419.7 582.8 406.6 592 391.9 592C377.7 592 364.9 583.4 359.6 570.3L295.4 412.3C290.9 401.3 292.9 388.7 300.6 379.7L395.1 267.3C400.2 261.2 399.8 252.3 394.2 246.7C388.6 241.1 379.6 240.7 373.6 245.8L261.2 340.1C252.1 347.7 239.6 349.7 228.6 345.3L70.1 280.8C57 275.5 48.4 262.7 48.4 248.5C48.4 233.8 57.6 220.7 71.5 215.7L568.4 37.7z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
}
