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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Task } from "@/types/task";
import { Status } from "@/types/status";
import { useUpdateTaskStatusMutation } from "@/state/api/modules/taskApi";
import TaskCard from "../TaskCard";
import DroppableColumn from "../DroppableColumn";
import EditTaskModal from "../EditTaskModal";
import { useRouter } from "next/router";
import SortableTaskCard from "./SortableTaskCard";

const STATUS_COLUMNS: { status: Status; label: string }[] = [
  { status: Status.ToDo, label: "To Do" },
  { status: Status.WorkInProgress, label: "In Progress" },
  { status: Status.UnderReview, label: "Reviewing" },
  { status: Status.Completed, label: "Done" },
];

interface KanbanBoardProps {
  tasks: Task[];
  departmentId?: string;
  onTaskUpdate?: () => void;
  projectId: string;
  projectTitle: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskUpdate,
  projectId,
  projectTitle,
}) => {
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [columns, setColumns] = useState(() =>
    STATUS_COLUMNS.reduce(
      (acc, { status }) => {
        acc[status] = tasks.filter((task) => task.status === status);
        return acc;
      },
      {} as Record<Status, Task[]>,
    ),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id);
    const sourceStatus = event.active.data.current?.status as Status;
    const task = columns[sourceStatus].find((t) => t.taskID === taskId);
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
        const sourceTasks = prev[sourceStatus].filter(
          (t) => t.taskID !== taskId,
        );
        const targetTasks = [
          ...prev[targetStatus],
          { ...task, status: targetStatus },
        ];
        return {
          ...prev,
          [sourceStatus]: sourceTasks,
          [targetStatus]: targetTasks,
        };
      });

      try {
        await updateTaskStatus({ taskId, status: targetStatus });
        if (onTaskUpdate) onTaskUpdate();
      } catch (err) {
        console.error("❌ Failed to update task status:", err);
      }
    }
  };
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-4 gap-4">
        {STATUS_COLUMNS.map(({ status, label }) => (
          <DroppableColumn key={status} status={status}>
            <h2 className="mb-2 text-lg font-semibold">{label}</h2>
            <SortableContext
              items={columns[status].map((t) => t.taskID)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {columns[status].map((task) => (
                  <SortableTaskCard
                    key={task.taskID}
                    task={task}
                    status={status}
                    projectId={projectId}
                    projectTitle={projectTitle}
                  />
                ))}
              </div>
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
