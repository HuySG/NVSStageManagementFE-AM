"use client";

import { useState } from "react";
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
import { Status } from "@/types/status";
import StaffTaskCard from "./StaffTaskCard";
import StaffDroppableColumn from "./StaffDroppableColumn";
import { useUpdateTaskStatusMutation } from "@/state/api/modules/taskApi";
import { PrepareTask } from "@/types/PrepareTask ";

const STATUS_COLUMNS: { status: Status; label: string }[] = [
  { status: Status.ToDo, label: "To Do" },
  { status: Status.WorkInProgress, label: "In Progress" },
  { status: Status.UnderReview, label: "Reviewing" },
  { status: Status.Completed, label: "Done" },
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

  const [columns, setColumns] = useState(() =>
    STATUS_COLUMNS.reduce(
      (acc, { status }) => {
        acc[status] = tasks.filter((t) => t.status === status);
        return acc;
      },
      {} as Record<Status, PrepareTask[]>,
    ),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const sourceStatus = event.active.data.current?.status as Status;
    const task = columns[sourceStatus]?.find((t) => t.taskID === taskId);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const taskId = String(active.id);
    const sourceStatus = active.data.current?.status as Status;
    const targetStatus = over.data.current?.status as Status;

    if (sourceStatus && targetStatus && sourceStatus !== targetStatus) {
      const task = columns[sourceStatus].find((t) => t.taskID === taskId);
      if (!task) return;

      setColumns((prev) => {
        const updated = { ...prev };
        updated[sourceStatus] = updated[sourceStatus].filter(
          (t) => t.taskID !== taskId,
        );
        updated[targetStatus] = [
          ...updated[targetStatus],
          { ...task, status: targetStatus },
        ];
        return updated;
      });

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {STATUS_COLUMNS.map(({ status, label }) => (
          <StaffDroppableColumn key={status} status={status}>
            <h2 className="mb-2 text-lg font-semibold">{label}</h2>
            <SortableContext
              items={columns[status].map((t) => t.taskID)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
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

      <DragOverlay>
        {activeTask ? (
          <StaffTaskCard
            task={activeTask}
            status={activeTask.status as Status}
            projectId={projectId}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default StaffKanban;
