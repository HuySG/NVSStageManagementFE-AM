import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/types/task";
import TaskCard from "../TaskCard";

interface SortableTaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
}

export default function SortableTaskCard({
  task,
  onClick,
  onEdit,
}: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.taskID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} onEdit={onEdit} />
    </div>
  );
}
