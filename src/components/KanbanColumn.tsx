"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  columnId: string;
  title: string;
  tasks: any[];
  userId?: string;
  userArea: string;
  isAdmin: boolean;
  onDeleteTask: (id: string) => void;
  onCommentAdded: () => void;
}

const columnIcons: Record<string, string> = {
  A_FAZER: "📋",
  FAZENDO: "⚡",
  CONCLUIDA: "✅",
};

const columnColors: Record<string, string> = {
  A_FAZER: "border-t-[#6c5ce7]",
  FAZENDO: "border-t-[#00cec9]",
  CONCLUIDA: "border-t-[#00b894]",
};

export function KanbanColumn({ columnId, title, tasks, userId, userArea, isAdmin, onDeleteTask, onCommentAdded }: KanbanColumnProps) {
  return (
    <div className={`glass rounded-xl border-t-2 ${columnColors[columnId]} flex flex-col min-w-[280px] w-[280px] sm:w-[300px] shrink-0`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#6c5ce7]/10">
        <div className="flex items-center gap-2">
          <span className="text-sm">{columnIcons[columnId]}</span>
          <h3 className="text-sm font-semibold text-[#e0e0ff]">{title}</h3>
        </div>
        <span className="text-xs text-[#505070] bg-[#ffffff08] px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-2.5 min-h-[120px] transition-colors ${
              snapshot.isDraggingOver ? "bg-[#6c5ce7]/5" : ""
            }`}
          >
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-20 text-xs text-[#505070]">
                Nenhuma tarefa
              </div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                userId={userId}
                userArea={userArea}
                isAdmin={isAdmin}
                onDelete={onDeleteTask}
                onCommentAdded={onCommentAdded}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
