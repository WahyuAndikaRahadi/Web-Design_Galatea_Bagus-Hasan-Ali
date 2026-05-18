"use client";

import { useState, useEffect } from "react";
import { getPusherClient, CHANNELS, EVENTS } from "@/lib/pusher";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { TaskCreateModal, TaskDetailModal } from "./TaskModals";
import { useToast } from "@/lib/toast";

type HubTask = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigneeId: string | null;
  labelTag: string | null;
  deadline: string | null;
  position: number;
  isGlobal: boolean;
  isApproved: boolean;
  revisionNote: string | null;
};

type Member = {
  userId: string;
  role: string;
  roleTitle: string | null;
  isAnonymous: boolean;
  anonymousTag: string | null;
  revealedAt: string | null;
  user: { id: string; name: string; username: string; image: string | null };
};

type Props = {
  projectId: string;
  roomId?: string;
  members: Member[];
  currentUserId: string;
  isGlobal?: boolean;
};

const COLS: { status: HubTask["status"]; label: string; color: string; accent: string }[] = [
  { status: "TODO", label: "📝 To Do", color: "#F5F0E8", accent: "#000000" },
  { status: "IN_PROGRESS", label: "⚡ In Progress", color: "#FFE500", accent: "#000000" },
  { status: "DONE", label: "✅ Done", color: "#00D37F", accent: "#000000" },
];

const PRIORITY_COLOR: Record<HubTask["priority"], string> = {
  LOW: "#00D37F",
  MEDIUM: "#FFE500",
  HIGH: "#FF4D4D",
};

export function HubKanban({ projectId, roomId, members, currentUserId, isGlobal = true }: Props) {
  const [tasks, setTasks] = useState<HubTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<HubTask | null>(null);
  const [createModal, setCreateModal] = useState<{ isOpen: boolean; status: HubTask["status"] }>({ isOpen: false, status: "TODO" });
  const [detailTask, setDetailTask] = useState<HubTask | null>(null);
  const toast = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const currentMember = members.find(m => m.userId === currentUserId);
  const canAssign = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN" || !!currentMember?.roleTitle;

  useEffect(() => {
    setLoading(true);
    const query = roomId ? `?roomId=${roomId}` : "";
    fetch(`/api/hub/${projectId}/tasks${query}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTasks(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, roomId]);

  useEffect(() => {
    let pusher: ReturnType<typeof getPusherClient>;
    try {
      pusher = getPusherClient();
      const channel = pusher.subscribe(CHANNELS.hub(projectId));
      channel.bind(EVENTS.HUB_TASK_UPDATED, (task: HubTask) => {
        setTasks((prev) => prev.map((t) => t.id === task.id ? task : t));
      });
      channel.bind(EVENTS.HUB_TASK_CREATED, (task: HubTask) => {
        setTasks((prev) => {
          if (prev.find((t) => t.id === task.id)) return prev;
          return [...prev, task];
        });
      });
    } catch {}
    return () => {
      try { pusher?.unsubscribe(CHANNELS.hub(projectId)); } catch {}
    };
  }, [projectId]);

  async function patchTask(taskId: string, updates: { status?: HubTask["status"]; position?: number }) {
    await fetch(`/api/hub/${projectId}/tasks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, ...updates }),
    });
  }

  function handleDragStart(event: any) {
    const draggedTask = tasks.find((t) => t.id === event.active.id);
    if (draggedTask) setActiveTask(draggedTask);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) return;

    const overData = over.data?.current as { type: string; status?: HubTask["status"] } | undefined;
    
    let targetStatus: HubTask["status"];
    if (overData?.type === "column") {
      targetStatus = overData.status!;
    } else if (overData?.type === "task") {
      targetStatus = overData.status!;
    } else {
      const validStatuses: HubTask["status"][] = ["TODO", "IN_PROGRESS", "DONE"];
      targetStatus = validStatuses.includes(overId as HubTask["status"])
        ? (overId as HubTask["status"])
        : draggedTask.status;
    }

    const currentMember = members.find(m => m.userId === currentUserId);
    const isPrivileged = currentMember?.role === "OWNER" || currentMember?.role === "ADMIN" || !!currentMember?.roleTitle;

    if (draggedTask.status !== targetStatus) {
      if (draggedTask.assigneeId && draggedTask.assigneeId !== currentUserId && !isPrivileged) {
        toast.error("Akses Ditolak", "Hanya penanggung jawab task ini atau Admin/Lead yang dapat mengubah statusnya.");
        return;
      }

      setTasks((prev) => prev.map((t) => t.id === activeId ? { ...t, status: targetStatus } : t));
      patchTask(activeId, { status: targetStatus });
    } else if (activeId !== overId && overData?.type === "task") {
      setTasks((prev) => {
        const oldIdx = prev.findIndex((t) => t.id === activeId);
        const newIdx = prev.findIndex((t) => t.id === overId);
        return arrayMove(prev, oldIdx, newIdx);
      });
      const newIdx = tasks.findIndex((t) => t.id === overId);
      patchTask(activeId, { position: newIdx });
    }
  }

  const getMemberName = (userId: string | null) => {
    if (!userId) return null;
    const m = members.find((m) => m.userId === userId);
    if (!m) return null;
    if (m.isAnonymous && !m.revealedAt) return `Anon#${m.anonymousTag || "0000"}`;
    return m.user.name;
  };

  function SortableTask({
    task,
    getMemberName,
  }: {
    task: HubTask;
    getMemberName: (id: string | null) => string | null;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.id,
      data: { type: "task", status: task.status, task },
    });
  
    return (
      <div
        ref={setNodeRef}
        onClick={() => setDetailTask(task)}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
          opacity: isDragging ? 0.35 : 1,
          background: "#FFFFFF",
          border: "3px solid #000000",
          boxShadow: isDragging ? "1px 1px 0px #000" : "3px 3px 0px #000000",
          borderRadius: "6px",
          padding: "12px",
          cursor: isDragging ? "grabbing" : "pointer",
          touchAction: "none",
        }}
        {...attributes}
        {...listeners}
      >
        <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "15px", margin: "0 0 8px", color: "#000000" }}>
          {task.title}
        </p>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {task.assigneeId ? (
            <span style={{ background: "#0047FF", border: "1.5px solid #000000", borderRadius: "4px", fontSize: "11px", fontWeight: 800, padding: "1px 6px", color: "#FFFFFF", fontFamily: "Space Grotesk, sans-serif" }}>
              👤 {getMemberName(task.assigneeId)}
            </span>
          ) : (
            <span style={{ background: "#F5F0E8", border: "1.5px solid #000000", borderRadius: "4px", fontSize: "11px", fontWeight: 800, padding: "1px 6px", color: "#666", fontFamily: "Space Grotesk, sans-serif", borderStyle: "dashed" }}>
              Unassigned
            </span>
          )}
          {task.isApproved && (
            <span style={{ background: "#00D37F", border: "1.5px solid #000", borderRadius: "4px", fontSize: "10px", fontWeight: 900, padding: "1px 6px", color: "#000" }}>
              ✅ APPROVED
            </span>
          )}
          {task.status === "DONE" && !task.isApproved && (
            <span style={{ background: "#FFE500", border: "1.5px solid #000", borderRadius: "4px", fontSize: "10px", fontWeight: 900, padding: "1px 6px", color: "#000" }}>
              ⏳ Menunggu Review
            </span>
          )}
        </div>
      </div>
    );
  }

  function DroppableColumn({
    col,
    colTasks,
    getMemberName,
  }: {
    col: typeof COLS[number];
    colTasks: HubTask[];
    getMemberName: (id: string | null) => string | null;
  }) {
    const { setNodeRef, isOver } = useDroppable({
      id: col.status,
      data: { type: "column", status: col.status },
    });
  
    return (
      <div style={{ minWidth: "300px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: col.color, border: `3px solid #000000`, borderRadius: "8px", padding: "10px 14px", boxShadow: "4px 4px 0px #000000" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "15px", color: col.accent }}>{col.label}</span>
            <span style={{ background: col.accent, color: col.color, borderRadius: "4px", padding: "2px 8px", fontSize: "12px", fontWeight: 900 }}>{colTasks.length}</span>
          </div>
          <button
            onClick={() => setCreateModal({ isOpen: true, status: col.status })}
            title="Tambah Task"
            style={{ background: "#000", color: col.color, border: "none", borderRadius: "4px", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 900, fontSize: "16px" }}
          >
            +
          </button>
        </div>
  
        {/* Task Area with Dashed Border */}
        <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div 
            ref={setNodeRef} 
            style={{ 
              flex: 1, 
              display: "flex", 
              flexDirection: "column", 
              gap: "10px", 
              minHeight: "150px", 
              padding: "12px", 
              borderRadius: "10px", 
              border: isOver ? "3px solid #0047FF" : "2px dashed #00000033", 
              background: isOver ? "rgba(0,71,255,0.04)" : "rgba(0,0,0,0.01)", 
              transition: "all 0.15s ease",
              position: "relative"
            }}
          >
            {colTasks.map((task) => (
              <SortableTask key={task.id} task={task} getMemberName={getMemberName} />
            ))}
            {colTasks.length === 0 && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: "12px", fontWeight: 700, fontStyle: "italic", opacity: 0.5 }}>
                    Belum ada task
                </div>
            )}
          </div>
        </SortableContext>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", color: "#3D3D3D", fontWeight: 800 }}>
        Memuat kanban...
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ flex: 1, background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 20px", borderBottom: "3px solid #000000", background: "#FFFFFF", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 900, fontSize: "18px", color: "#000000" }}>
            📋 {isGlobal ? "Kanban Board" : "Task Board"}
          </div>
          <div style={{ background: "#F5F0E8", border: "2px solid #000000", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 800, color: "#000000", fontFamily: "JetBrains Mono, monospace", boxShadow: "2px 2px 0px #000" }}>
            {tasks.length} task
          </div>
        </div>

        <div style={{ flex: 1, overflowX: "auto", padding: "20px", display: "flex", gap: "20px" }}>
          {COLS.map((col) => {
            const colTasks = tasks
              .filter((t) => t.status === col.status)
              .sort((a, b) => a.position - b.position);
            return (
              <DroppableColumn
                key={col.status}
                col={col}
                colTasks={colTasks}
                getMemberName={getMemberName}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div style={{
              background: "#FFFFFF",
              border: "3px solid #000000",
              boxShadow: "8px 8px 0px #000000",
              borderRadius: "6px",
              padding: "12px",
              opacity: 0.95,
              cursor: "grabbing",
              width: "300px",
              rotate: "2deg",
            }}>
              <p style={{ fontFamily: "Space Grotesk, sans-serif", fontWeight: 800, fontSize: "15px", margin: "0 0 8px", color: "#000000" }}>
                {activeTask.title}
              </p>
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <span style={{ background: "#0047FF", border: "1.5px solid #000000", borderRadius: "4px", fontSize: "11px", fontWeight: 800, padding: "1px 6px", color: "#FFFFFF" }}>
                  👤 {getMemberName(activeTask.assigneeId) || "Unassigned"}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>

      {createModal.isOpen && (
         <TaskCreateModal 
           isOpen={createModal.isOpen} 
           onClose={() => setCreateModal({ ...createModal, isOpen: false })}
           status={createModal.status}
           members={members}
           onCreated={(t) => setTasks([...tasks, t])}
           projectId={projectId}
           roomId={roomId}
           currentUserId={currentUserId}
           canAssign={canAssign}
         />
       )}
       {detailTask && (
         <TaskDetailModal
           isOpen={!!detailTask}
           onClose={() => setDetailTask(null)}
           task={detailTask}
           members={members}
           currentUserId={currentUserId}
           projectId={projectId}
           canAssign={canAssign}
           onUpdate={(updated) => setTasks(tasks.map(t => t.id === updated.id ? updated : t))}
         />
       )}
    </DndContext>
  );
}
