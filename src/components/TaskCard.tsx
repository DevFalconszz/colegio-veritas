"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Lock, User, Trash2, MessageSquare, Send } from "lucide-react";

interface TaskCardProps {
  task: any;
  index: number;
  userId?: string;
  userArea: string;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  onCommentAdded?: () => void;
}

const statusColors: Record<string, string> = {
  A_FAZER: "border-l-[#6c5ce7]",
  FAZENDO: "border-l-[#00cec9]",
  CONCLUIDA: "border-l-[#00b894]",
};

const areaColors: Record<string, string> = {
  SECRETARIA: "bg-[#6c5ce7]/20 text-[#6c5ce7]",
  COMERCIAL: "bg-[#00cec9]/20 text-[#00cec9]",
  TI: "bg-[#fdcb6e]/20 text-[#fdcb6e]",
  FINANCEIRO: "bg-[#e17055]/20 text-[#e17055]",
};

export function TaskCard({ task, index, userId, userArea, isAdmin, onDelete, onCommentAdded }: TaskCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const isLockedByOther = !!(task.lockedBy && task.lockedBy.id !== userId);
  const isSameArea = task.area === userArea;
  const canDrag = isAdmin || (isSameArea && !isLockedByOther);
  const canComment = isAdmin || isSameArea;
  const commentCount = task.comments?.length || 0;

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || sending) return;
    setSending(true);

    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment }),
    });

    if (res.ok) {
      const comment = await res.json();
      task.comments = [...(task.comments || []), comment];
      setNewComment("");
      onCommentAdded?.();
    }
    setSending(false);
  }

  return (
    <Draggable
      draggableId={task.id}
      index={index}
      isDragDisabled={!canDrag}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border-l-4 ${statusColors[task.status]} ${
            snapshot.isDragging
              ? "glass-drag z-[9999]"
              : "glass"
          } ${!canDrag ? "opacity-70" : "hover:border-[#6c5ce7]/50"} cursor-grab active:cursor-grabbing group`}
          style={provided.draggableProps.style}
        >
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e0e0ff] truncate">
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-[#707090] mt-1 line-clamp-2">
                    {task.description}
                  </p>
                )}
              </div>
              {isAdmin && onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-[#505070] hover:text-red-400 transition-all shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-2.5">
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${areaColors[task.area] || "bg-[#ffffff10] text-[#a0a0c0]"}`}
              >
                {task.area}
              </span>

              <div className="flex items-center gap-1.5">
                {task.lockedBy && (
                  <span className="flex items-center gap-1 text-[10px] text-[#00cec9]">
                    <Lock size={10} />
                    {task.lockedBy.name}
                  </span>
                )}
                {task.assignedTo && !task.lockedBy && (
                  <span className="flex items-center gap-1 text-[10px] text-[#a0a0c0]">
                    <User size={10} />
                    {task.assignedTo.name}
                  </span>
                )}
              </div>
            </div>

            {commentCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex items-center gap-1 mt-2 text-[10px] text-[#6c5ce7] hover:text-[#8b7cf7] transition-colors"
              >
                <MessageSquare size={12} />
                {commentCount} comentário{commentCount !== 1 ? "s" : ""}
              </button>
            )}
          </div>

          {showComments && (
            <div className="border-t border-[#6c5ce7]/10 px-3.5 py-2 space-y-2 max-h-48 overflow-y-auto">
              {(!task.comments || task.comments.length === 0) && (
                <p className="text-[10px] text-[#505070] text-center">Nenhum comentário</p>
              )}
              {task.comments?.map((c: any) => (
                <div key={c.id} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[#a0a0c0]">{c.user.name}</span>
                    <span className="text-[10px] text-[#505070]">
                      {new Date(c.createdAt).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[#c0c0e0] mt-0.5">{(c.content as string).split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) => i % 2 === 1 ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-[#6c5ce7] hover:underline break-all">{part}</a> : part)}</p>
                </div>
              ))}

              {canComment && (
                <form onSubmit={handleAddComment} className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..."
                    className="flex-1 bg-[#0a0a1a]/60 border border-[#6c5ce7]/20 rounded-md px-2 py-1 text-xs text-[#e0e0ff] placeholder:text-[#505070] focus:outline-none focus:border-[#6c5ce7]/50"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newComment.trim()}
                    className="text-[#6c5ce7] hover:text-[#8b7cf7] disabled:opacity-30 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
              )}

              {!canComment && task.lockedBy && (
                <p className="text-[10px] text-[#505070] text-center pt-1">
                  Apenas {task.lockedBy.name} pode comentar
                </p>
              )}
            </div>
          )}

          {!showComments && canComment && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
              className="w-full border-t border-[#6c5ce7]/10 px-3.5 py-1.5 text-[10px] text-[#505070] hover:text-[#6c5ce7] hover:bg-[#ffffff05] transition-colors flex items-center justify-center gap-1"
            >
              <MessageSquare size={12} />
              {commentCount > 0 ? "Ver comentários" : "Comentar"}
            </button>
          )}
        </div>
      )}
    </Draggable>
  );
}
