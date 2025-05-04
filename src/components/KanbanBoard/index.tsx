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

const STATUS_COLUMNS: { status: Status; label: string }[] = [
  { status: Status.ToDo, label: "To Do" },
  { status: Status.WorkInProgress, label: "In Progress" },
  { status: Status.UnderReview, label: "Reviewing" },
  { status: Status.Completed, label: "Done" },
];

interface KanbanBoardProps {
  tasks: Task[];
  departmentId?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks }) => {
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

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

function SortableTaskCard({ task, status }: { task: Task; status: Status }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.taskID,
      data: { status },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}
