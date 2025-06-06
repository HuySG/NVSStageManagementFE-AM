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
}

export default function SortableTaskCard({ task, status, projectId }: Props) {
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

  // Để click toàn bộ card sẽ sang trang chi tiết
  const handleClick = () => {
    router.push(`/tasks/${projectId}/${task.taskID}`);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="">
      <div className="relative">
        {/* Drag Handle bên phải (giống staff) */}
        <div
          {...listeners}
          className="absolute right-2 top-2 z-10 cursor-grab text-gray-400"
          onClick={(e) => e.stopPropagation()}
          title="Kéo để di chuyển"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Card click => chi tiết */}
        <div onClick={handleClick}>
          <TaskCard task={task} status={status} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
