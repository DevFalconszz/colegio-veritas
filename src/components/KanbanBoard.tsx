"use client";

import { useState, useEffect, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useSession } from "next-auth/react";
import { KanbanColumn } from "./KanbanColumn";
import { Plus, RefreshCw } from "lucide-react";

const columns = [
  { id: "A_FAZER", title: "A Fazer" },
  { id: "FAZENDO", title: "Fazendo" },
  { id: "CONCLUIDA", title: "Concluídas" },
];

const areaLabels: Record<string, string> = {
  SECRETARIA: "Secretaria",
  COMERCIAL: "Comercial",
  TI: "TI",
  FINANCEIRO: "Financeiro",
};

export function KanbanBoard() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";
  const userArea = user?.area;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newArea, setNewArea] = useState("SECRETARIA");
  const [filterArea, setFilterArea] = useState<string>("TODAS");

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    if (!isAdmin && task.area !== userArea) return;
    if (task.lockedBy && task.lockedBy.id !== user?.id && !isAdmin) return;

    const newStatus = destination.droppableId;
    if (newStatus === "FAZENDO" && task.lockedBy && task.lockedBy.id !== user?.id && !isAdmin) return;

    const shouldLock = newStatus === "FAZENDO" && !task.lockedById;
    const previous = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId
          ? {
              ...t,
              status: newStatus,
              ...(shouldLock
                ? {
                    lockedById: user?.id,
                    assignedToId: user?.id,
                    lockedBy: { id: user?.id, name: user?.name },
                    assignedTo: { id: user?.id, name: user?.name, area: user?.area },
                  }
                : {}),
            }
          : t
      )
    );

    const res = await fetch(`/api/tasks/${draggableId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) {
      setTasks(previous);
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDesc, area: newArea }),
    });

    if (res.ok) {
      const task = await res.json();
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setNewDesc("");
      setShowCreate(false);
    }
  }

  async function handleDeleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  }

  const filteredTasks = tasks.filter((t) => {
    if (!isAdmin && t.area !== userArea) return false;
    if (filterArea !== "TODAS" && t.area !== filterArea) return false;
    return true;
  });

  const getColumnTasks = (columnId: string) =>
    filteredTasks.filter((t) => t.status === columnId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-[#6c5ce7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gradient">Quadro de Tarefas</h1>
            <p className="text-xs text-[#707090] mt-0.5">
              Arraste os cards para mover entre as colunas
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-3 py-1.5 text-sm text-[#e0e0ff] focus:outline-none focus:border-[#6c5ce7]/50"
              >
                <option value="TODAS">Todas as áreas</option>
                <option value="SECRETARIA">Secretaria</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="TI">TI</option>
                <option value="FINANCEIRO">Financeiro</option>
              </select>
            )}

            <button
                onClick={() => setShowCreate(!showCreate)}
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={16} />
                Nova Tarefa
              </button>

            <button
              onClick={fetchTasks}
              className="p-2 text-[#505070] hover:text-[#6c5ce7] transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreateTask}
            className="glass rounded-xl p-4 mb-6 border border-[#6c5ce7]/20 space-y-3"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Título da tarefa"
              className="w-full bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-4 py-2 text-[#e0e0ff] placeholder:text-[#505070] focus:outline-none focus:border-[#6c5ce7]/50 text-sm"
              required
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descrição (opcional)"
              rows={2}
              className="w-full bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-4 py-2 text-[#e0e0ff] placeholder:text-[#505070] focus:outline-none focus:border-[#6c5ce7]/50 text-sm resize-none"
            />
            <div className="flex items-center gap-2">
              {isAdmin && (
                <select
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-lg px-3 py-2 text-sm text-[#e0e0ff] focus:outline-none focus:border-[#6c5ce7]/50"
                >
                  <option value="SECRETARIA">Secretaria</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="TI">TI</option>
                  <option value="FINANCEIRO">Financeiro</option>
                </select>
              )}
              <button
                type="submit"
                className="bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[#505070] hover:text-[#a0a0c0] px-3 py-2 text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 relative justify-center">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                columnId={col.id}
                title={col.title}
                tasks={getColumnTasks(col.id)}
                userId={user?.id}
                userArea={userArea}
                isAdmin={isAdmin}
                onDeleteTask={handleDeleteTask}
                onCommentAdded={fetchTasks}
              />
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
