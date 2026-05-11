"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import { useToast } from "@/lib/toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigneeId: string | null;
  labelTag: string | null;
  deadline: string | null;
  position: number;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; image: string | null; isAnonymous?: boolean };
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

type Poll = {
  id: string;
  question: string;
  isActive: boolean;
  options: { id: string; text: string; votes: { userId: string }[] }[];
};

type Project = {
  id: string;
  title: string;
  members: Member[];
  tasks: Task[];
  polls: Poll[];
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function CollabRoomClient({
  project: initialProject,
  currentUserId,
  isOwner,
  currentMember,
}: {
  project: Project;
  currentUserId: string;
  isOwner: boolean;
  currentMember: Member;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialProject.tasks);
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Poll[]>(initialProject.polls);
  const [members, setMembers] = useState<Member[]>(initialProject.members);
  const [activeTab, setActiveTab] = useState<"kanban" | "chat" | "poll">("kanban");
  const toast = useToast();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load message history
  useEffect(() => {
    fetch(`/api/chat/${initialProject.id}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMessages(data); })
      .catch(() => {});
  }, [initialProject.id]);

  // Pusher subscriptions
  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.project(initialProject.id));

      channel.bind(EVENTS.NEW_MESSAGE, (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      channel.bind(EVENTS.TASK_UPDATED, (task: Task) => {
        setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
      });

      channel.bind(EVENTS.TASK_CREATED, (task: Task) => {
        setTasks((prev) => [...prev, task]);
      });

      channel.bind(EVENTS.MESSAGE_DELETED, ({ messageId }: { messageId: string }) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      });

      channel.bind(EVENTS.MEMBER_KICKED, ({ userId }: { userId: string }) => {
        if (userId === currentUserId) {
          window.location.href = "/dashboard?reason=kicked";
        }
      });

      channel.bind(EVENTS.IDENTITY_REVEALED, ({ memberId, userName, anonymousTag }: { memberId: string; userName: string; anonymousTag: string }) => {
        setMembers((prev) => prev.map((m) => 
          m.id === memberId ? { ...m, revealedAt: new Date().toISOString(), isAnonymous: false } : m
        ));
        toast.success("✨ Identity Revealed", `Anon#${anonymousTag} ternyata adalah ${userName}!`);
      });
    } catch {
      // Pusher not configured
    }

    return () => {
      try { pusher?.unsubscribe(CHANNELS.project(initialProject.id)); } catch {}
    };
  }, [initialProject.id]);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Mobile tab nav */}
      <div style={{ display: "none" }} className="mobile-tabs" />

      {/* ─── Sidebar: Members ─── */}
      <div style={{
        width: "200px",
        background: "#000",
        borderRight: "2px solid #333",
        padding: "16px",
        overflowY: "auto",
        flexShrink: 0,
      }} className="hidden lg:block">
        <p style={{ color: "#FFE500", fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>
          👥 Anggota
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {members.map((m) => {
            const isAnonymous = m.isAnonymous && !m.revealedAt;
            const displayName = isAnonymous ? `Anon#${m.anonymousTag || "0000"}` : m.user.name;
            const isMe = m.userId === currentUserId;

            return (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: isAnonymous ? "#333" : (m.role === "OWNER" ? "#FFE500" : "#fff"),
                      border: "2px solid #000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", fontWeight: 700,
                      color: isAnonymous ? "#888" : "#000",
                      flexShrink: 0,
                      boxShadow: "2px 2px 0px #000"
                    }}>
                      {isAnonymous ? "🕵️" : displayName[0]}
                    </div>
                    <span style={{ color: "#fff", fontSize: "13px", fontWeight: isMe ? 700 : 400 }}>
                      {displayName}
                      {m.role === "OWNER" && <span style={{ marginLeft: "4px", fontSize: "10px", color: "#FFE500" }}>👑</span>}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "4px" }}>
                    {isOwner && !isMe && (
                      <button
                        onClick={async () => {
                          if (confirm(`Kick ${displayName}?`)) {
                            await fetch(`/api/projects/${initialProject.id}/members/${m.id}`, { method: "DELETE" });
                          }
                        }}
                        style={{ background: "transparent", border: "none", color: "#FF4D4D", cursor: "pointer", padding: "4px", fontSize: "12px" }}
                        title="Kick dari project"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {isMe && isAnonymous && (
                  <button
                    onClick={async () => {
                      if (confirm("Buka identitasmu sekarang? Semua orang akan tahu siapa kamu.")) {
                        const res = await fetch(`/api/projects/${initialProject.id}/members/${m.id}/reveal`, { method: "POST" });
                        if (!res.ok) toast.error("Error", "Gagal membuka identitas");
                      }
                    }}
                    style={{
                      background: "#FFE500",
                      border: "1.5px solid #000",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "1.5px 1.5px 0px #000",
                      marginTop: "2px",
                      textAlign: "center"
                    }}
                  >
                    ✨ Reveal Identity
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Main Area: Tabs ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tab nav */}
        <div style={{ background: "#111", borderBottom: "2px solid #333", display: "flex" }}>
          {(["kanban", "chat", "poll"] as const).map((tab) => (
            <button
              key={tab}
              id={`room-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "12px 20px",
                background: activeTab === tab ? "#FFE500" : "transparent",
                color: activeTab === tab ? "#000" : "#999",
                border: "none",
                borderRight: "1px solid #333",
                fontFamily: "Space Grotesk, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tab === "kanban" ? "📋 Kanban" : tab === "chat" ? "💬 Chat" : "📊 Poll"}
            </button>
          ))}
        </div>

        {/* ─── Kanban ─── */}
        {activeTab === "kanban" && (
          <KanbanTab tasks={tasks} setTasks={setTasks} projectId={initialProject.id} members={initialProject.members} currentUserId={currentUserId} />
        )}

        {/* ─── Chat ─── */}
        {activeTab === "chat" && (
          <ChatTab messages={messages} projectId={initialProject.id} currentUserId={currentUserId} chatEndRef={chatEndRef} currentMember={currentMember} />
        )}

        {/* ─── Poll ─── */}
        {activeTab === "poll" && (
          <PollTab polls={polls} setPolls={setPolls} projectId={initialProject.id} currentUserId={currentUserId} isOwner={isOwner} />
        )}
      </div>
    </div>
  );
}

// ─── Kanban Tab ───────────────────────────────────────────────────────────────

function KanbanTab({ tasks, setTasks, projectId, members, currentUserId }: {
  tasks: Task[];
  setTasks: (fn: (prev: Task[]) => Task[]) => void;
  projectId: string;
  members: Member[];
  currentUserId: string;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingCol, setAddingCol] = useState<string | null>(null);

  const cols: Array<{ status: Task["status"]; label: string; color: string }> = [
    { status: "TODO", label: "📝 To Do", color: "#F5F0E8" },
    { status: "IN_PROGRESS", label: "⚡ In Progress", color: "#FFE500" },
    { status: "DONE", label: "✅ Done", color: "#00D37F" },
  ];

  async function moveTask(taskId: string, newStatus: Task["status"]) {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: newStatus }),
    });
  }

  async function addTask(status: Task["status"]) {
    if (!newTaskTitle.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, title: newTaskTitle.trim(), status }),
    });
    if (res.ok) {
      setNewTaskTitle("");
      setAddingCol(null);
    }
  }

  const priorityColor: Record<Task["priority"], string> = { LOW: "#00D37F", MEDIUM: "#FFE500", HIGH: "#FF4D4D" };

  return (
    <div style={{ flex: 1, overflowX: "auto", padding: "20px", display: "flex", gap: "16px", background: "#1a1a1a" }}>
      {cols.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} style={{ minWidth: "280px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Column header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: col.color, border: "2px solid #fff", borderRadius: "6px", padding: "10px 14px" }}>
              <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px", color: "#000" }}>
                {col.label}
              </span>
              <span style={{ background: "#000", color: "#FFE500", borderRadius: "4px", padding: "2px 8px", fontSize: "12px", fontWeight: 700 }}>
                {colTasks.length}
              </span>
            </div>

            {/* Tasks */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", minHeight: "100px" }}>
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  id={`task-card-${task.id}`}
                  style={{
                    background: "#fff",
                    border: "2px solid #fff",
                    borderLeft: `4px solid ${priorityColor[task.priority]}`,
                    borderRadius: "6px",
                    padding: "12px",
                    cursor: "grab",
                  }}
                >
                  <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 700, fontSize: "14px", margin: "0 0 8px", color: "#000" }}>
                    {task.title}
                  </p>
                  {task.labelTag && (
                    <span style={{ background: "#F5F0E8", border: "1px solid #000", borderRadius: "3px", fontSize: "10px", fontWeight: 700, padding: "1px 6px", fontFamily: "JetBrains Mono, monospace" }}>
                      {task.labelTag}
                    </span>
                  )}
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                    {col.status !== "TODO" && (
                      <button
                        onClick={() => moveTask(task.id, "TODO")}
                        style={{ background: "#F5F0E8", border: "1px solid #000", borderRadius: "3px", padding: "2px 8px", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                      >← To Do</button>
                    )}
                    {col.status !== "IN_PROGRESS" && (
                      <button
                        onClick={() => moveTask(task.id, "IN_PROGRESS")}
                        style={{ background: "#FFE500", border: "1px solid #000", borderRadius: "3px", padding: "2px 8px", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                      >⚡ In Progress</button>
                    )}
                    {col.status !== "DONE" && (
                      <button
                        onClick={() => moveTask(task.id, "DONE")}
                        style={{ background: "#00D37F", border: "1px solid #000", borderRadius: "3px", padding: "2px 8px", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}
                      >✓ Done</button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add task */}
              {addingCol === col.status ? (
                <div style={{ display: "flex", gap: "6px" }}>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask(col.status)}
                    id={`add-task-input-${col.status}`}
                    placeholder="Nama task..."
                    style={{ flex: 1, background: "#fff", border: "2px solid #fff", borderRadius: "4px", padding: "8px", fontSize: "13px", outline: "none" }}
                    autoFocus
                  />
                  <button onClick={() => addTask(col.status)} style={{ background: "#FFE500", border: "2px solid #fff", borderRadius: "4px", padding: "8px 12px", cursor: "pointer", fontWeight: 700 }}>+</button>
                  <button onClick={() => setAddingCol(null)} style={{ background: "#333", border: "2px solid #555", borderRadius: "4px", padding: "8px 12px", cursor: "pointer", color: "#fff" }}>✕</button>
                </div>
              ) : (
                <button
                  onClick={() => { setAddingCol(col.status); setNewTaskTitle(""); }}
                  id={`add-task-btn-${col.status}`}
                  style={{ background: "transparent", border: "2px dashed #555", borderRadius: "6px", padding: "10px", color: "#888", cursor: "pointer", fontSize: "13px", fontWeight: 600, width: "100%" }}
                >
                  + Tambah Task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab({ messages, projectId, currentUserId, chatEndRef, currentMember }: {
  messages: Message[];
  projectId: string;
  currentUserId: string;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  currentMember: Member;
}) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const canModerate = currentMember.role === "OWNER" || currentMember.role === "ADMIN";

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    setIsSending(true);
    try {
      await fetch(`/api/chat/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim(), mentions: [] }),
      });
      setInput("");
    } finally {
      setIsSending(false);
    }
  }

  async function deleteMessage(messageId: string) {
    if (!confirm("Hapus pesan ini?")) return;
    await fetch(`/api/chat/${projectId}?messageId=${messageId}`, {
      method: "DELETE",
    });
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#111", overflow: "hidden" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#555", padding: "32px" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>💬</div>
            <p>Belum ada pesan. Mulai percakapan!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "70%", position: "relative" }} className="group">
                <div style={{ fontSize: "11px", color: "#888", marginBottom: "3px", textAlign: isMe ? "right" : "left" }}>
                  {msg.sender.name}
                </div>
                <div style={{
                  background: isMe ? "#FFE500" : "#222",
                  color: isMe ? "#000" : "#fff",
                  border: isMe ? "2px solid #FFE500" : "2px solid #333",
                  borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                  padding: "10px 14px",
                  fontSize: "14px",
                  wordBreak: "break-word",
                  position: "relative"
                }}>
                  {msg.content}
                </div>
                {(isMe || canModerate) && (
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    style={{
                      position: "absolute",
                      top: "22px",
                      [isMe ? "left" : "right"]: "-28px",
                      background: "transparent",
                      border: "none",
                      color: "#555",
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: "4px",
                    }}
                    className="hidden group-hover:block"
                    title="Hapus pesan"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} style={{ borderTop: "2px solid #333", padding: "12px 16px", display: "flex", gap: "8px", background: "#000" }}>
        <input
          type="text"
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan... (@mention dengan @nama)"
          style={{ flex: 1, background: "#222", border: "2px solid #333", borderRadius: "6px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}
        />
        <button
          type="submit"
          id="chat-send-btn"
          disabled={isSending || !input.trim()}
          style={{
            background: "#FFE500",
            border: "2px solid #FFE500",
            borderRadius: "6px",
            padding: "10px 20px",
            fontFamily: "Space Grotesk, sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            color: "#000",
            opacity: isSending || !input.trim() ? 0.5 : 1,
          }}
        >
          Kirim
        </button>
      </form>
    </div>
  );
}

// ─── Poll Tab ─────────────────────────────────────────────────────────────────

function PollTab({ polls, setPolls, projectId, currentUserId, isOwner }: {
  polls: Poll[];
  setPolls: (fn: (prev: Poll[]) => Poll[]) => void;
  projectId: string;
  currentUserId: string;
  isOwner: boolean;
}) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const validOptions = newOptions.filter((o) => o.trim());
    if (validOptions.length < 2) return;

    const res = await fetch(`/api/projects/${projectId}/poll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQuestion, options: validOptions }),
    });
    if (res.ok) {
      const poll = await res.json();
      setPolls((prev) => [...prev, poll]);
      setNewQuestion("");
      setNewOptions(["", ""]);
      setShowCreateForm(false);
    }
  }

  async function vote(pollId: string, optionId: string) {
    const res = await fetch(`/api/projects/${projectId}/poll/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPolls((prev) => prev.map((p) => p.id === pollId ? updated : p));
    }
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#111", display: "flex", flexDirection: "column", gap: "16px" }}>
      {isOwner && (
        <div>
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              id="create-poll-btn"
              style={{ background: "#FFE500", border: "2px solid #FFE500", borderRadius: "6px", padding: "12px 20px", fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "14px", cursor: "pointer", color: "#000" }}
            >
              + Buat Poll Baru
            </button>
          ) : (
            <form onSubmit={createPoll} style={{ background: "#222", border: "2px solid #333", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                id="poll-question-input"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Pertanyaan poll..."
                style={{ background: "#333", border: "2px solid #555", borderRadius: "6px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}
                required
              />
              {newOptions.map((opt, i) => (
                <input
                  key={i}
                  type="text"
                  id={`poll-option-${i + 1}`}
                  value={opt}
                  onChange={(e) => { const o = [...newOptions]; o[i] = e.target.value; setNewOptions(o); }}
                  placeholder={`Pilihan ${i + 1}...`}
                  style={{ background: "#333", border: "2px solid #555", borderRadius: "6px", padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none" }}
                />
              ))}
              <button type="button" onClick={() => setNewOptions([...newOptions, ""])} style={{ background: "transparent", border: "2px dashed #555", borderRadius: "6px", padding: "8px", color: "#888", cursor: "pointer" }}>
                + Tambah Pilihan
              </button>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" id="poll-create-submit" style={{ background: "#FFE500", border: "2px solid #FFE500", borderRadius: "6px", padding: "10px 20px", fontWeight: 800, cursor: "pointer", color: "#000", flex: 1 }}>
                  Buat Poll
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} style={{ background: "#333", border: "2px solid #555", borderRadius: "6px", padding: "10px 20px", color: "#fff", cursor: "pointer" }}>
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {polls.length === 0 ? (
        <div style={{ textAlign: "center", color: "#555", padding: "40px" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📊</div>
          <p>Belum ada poll aktif.</p>
        </div>
      ) : (
        polls.map((poll) => {
          const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
          const hasVoted = poll.options.some((o) => o.votes.some((v) => v.userId === currentUserId));
          return (
            <div key={poll.id} id={`poll-${poll.id}`} style={{ background: "#222", border: "2px solid #333", borderRadius: "8px", padding: "20px" }}>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "16px", color: "#FFE500", marginBottom: "16px" }}>
                📊 {poll.question}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {poll.options.map((option) => {
                  const pct = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                  const myVote = option.votes.some((v) => v.userId === currentUserId);
                  return (
                    <button
                      key={option.id}
                      onClick={() => !hasVoted && vote(poll.id, option.id)}
                      id={`poll-option-vote-${option.id}`}
                      style={{
                        position: "relative",
                        border: myVote ? "2px solid #FFE500" : "2px solid #555",
                        borderRadius: "6px",
                        padding: "10px 14px",
                        cursor: hasVoted ? "default" : "pointer",
                        background: "#1a1a1a",
                        overflow: "hidden",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: `${pct}%`, background: myVote ? "rgba(255,229,0,0.2)" : "rgba(255,255,255,0.05)", transition: "width 0.3s ease" }} />
                      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: myVote ? "#FFE500" : "#fff", fontWeight: myVote ? 700 : 400, fontSize: "14px" }}>
                          {option.text}
                        </span>
                        <span style={{ color: "#888", fontSize: "13px", fontFamily: "JetBrains Mono, monospace" }}>
                          {pct}% ({option.votes.length})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p style={{ color: "#555", fontSize: "12px", marginTop: "10px" }}>{totalVotes} total vote</p>
            </div>
          );
        })
      )}
    </div>
  );
}
