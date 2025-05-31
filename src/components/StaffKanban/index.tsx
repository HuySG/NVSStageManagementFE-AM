"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import StaffTaskCard from "./StaffTaskCard";
import StaffDroppableColumn from "./StaffDroppableColumn";
import { useUpdateTaskStatusMutation } from "@/state/api/modules/taskApi";
import { PrepareTask } from "@/types/PrepareTask ";
import { Status } from "@/types/status";
import { Plus } from "lucide-react";

const STATUS_COLUMNS: {
  status: Status;
  label: string;
  color: string;
  bg: string;
  dot: string;
}[] = [
  {
    status: Status.ToDo,
    label: "Cần thực hiện",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-neutral-800",
    dot: "bg-blue-500",
  },
  {
    status: Status.WorkInProgress,
    label: "Đang thực hiện",
    color: "text-yellow-700",
    bg: "bg-yellow-50 dark:bg-yellow-950",
    dot: "bg-yellow-500",
  },
  {
    status: Status.UnderReview,
    label: "Chờ duyệt",
    color: "text-violet-700",
    bg: "bg-violet-50 dark:bg-violet-950",
    dot: "bg-violet-500",
  },
  {
    status: Status.Completed,
    label: "Hoàn thành",
    color: "text-green-700",
    bg: "bg-green-50 dark:bg-green-950",
    dot: "bg-green-500",
  },
];

interface StaffKanbanProps {
  tasks: PrepareTask[];
  onTaskUpdate?: () => void;
  projectId: string;
}

const StaffKanban: React.FC<StaffKanbanProps> = ({
  tasks,
  onTaskUpdate,
  projectId,
}) => {
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [activeTask, setActiveTask] = useState<PrepareTask | null>(null);

  // Tính lại danh sách task mỗi cột theo status
  const columns = useMemo(
    () =>
      STATUS_COLUMNS.reduce(
        (acc, { status }) => {
          acc[status] = tasks.filter((t) => t.status === status);
          return acc;
        },
        {} as Record<Status, PrepareTask[]>,
      ),
    [tasks],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const sourceStatus = event.active.data.current?.status as Status;
    const task = columns[sourceStatus]?.find((t) => t.taskID === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = String(active.id);
    const sourceStatus = active.data.current?.status as Status;
    const targetStatus = over.data.current?.status as Status;

    if (sourceStatus && targetStatus && sourceStatus !== targetStatus) {
      try {
        await updateTaskStatus({ taskId, status: targetStatus });
        if (onTaskUpdate) onTaskUpdate();
      } catch (err) {
        console.error("❌ Lỗi cập nhật trạng thái task:", err);
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full px-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {STATUS_COLUMNS.map(({ status, label, bg, color, dot }) => (
            <StaffDroppableColumn
              key={status}
              status={status}
              className={`flex h-full flex-col ${bg} rounded-2xl px-0 py-0 shadow-md transition-all`}
            >
              {/* Header */}
              <div
                className={`mb-3 flex items-center justify-between rounded-t-2xl px-5 py-4 font-semibold shadow ${color} border-b bg-white/90 dark:bg-neutral-900`}
              >
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${dot}`}></span>
                  <span className="text-base">{label}</span>
                  <span className="ml-2 inline-block min-w-[28px] rounded-full bg-gray-100 px-2 py-0.5 text-center text-sm font-bold leading-none dark:bg-neutral-800">
                    {columns[status].length}
                  </span>
                </div>
              </div>
              <SortableContext
                items={columns[status].map((t) => t.taskID)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 space-y-4 px-4 py-3">
                  {columns[status].map((task) => (
                    <StaffTaskCard
                      key={task.taskID}
                      task={task}
                      status={status}
                      projectId={projectId}
                    />
                  ))}
                </div>
              </SortableContext>
            </StaffDroppableColumn>
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="max-w-xs">
            <StaffTaskCard
              task={activeTask}
              status={activeTask.status as Status}
              projectId={projectId}
              dragPreview
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default StaffKanban;
