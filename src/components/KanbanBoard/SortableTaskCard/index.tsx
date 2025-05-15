"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import { Task } from "@/types/task";
import { Status } from "@/types/status";
import TaskCard from "@/components/TaskCard";
import { GripVertical } from "lucide-react";

interface Props {
  task: Task;
  status: Status;
  projectId: string;
  projectTitle: string;
}

export default function SortableTaskCard({
  task,
  status,
  projectId,
  projectTitle,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.taskID,
      data: { status },
    });

  const router = useRouter();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEditClick = () => {
    router.push(`/tasks/${projectId}/${task.taskID}`);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative rounded border bg-white shadow-sm"
    >
      {/* Drag Handle Icon (≡) */}
      <div
        {...listeners}
        className="absolute left-2 top-2 z-10 cursor-grab text-gray-400"
        onClick={(e) => e.stopPropagation()} // để không mở Edit khi kéo
        title="Kéo để di chuyển"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Click toàn card để mở Edit page */}
      <div onClick={handleEditClick}>
        <TaskCard task={task} onEdit={handleEditClick} />
      </div>
    </div>
  );
}
