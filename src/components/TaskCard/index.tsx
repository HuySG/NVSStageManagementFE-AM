import { Task } from "@/types/task";
import { Status } from "@/types/status";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge"; // nếu bạn dùng shadcn/ui
import { cn } from "@/lib/utils"; // hàm kết hợp className

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

const statusStyleMap: Record<Status, string> = {
  ToDo: "border-blue-500 bg-blue-100",
  WorkInProgress: "border-yellow-500 bg-yellow-100",
  UnderReview: "border-purple-500 bg-purple-100",
  Completed: "border-green-500 bg-green-100",
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const formattedStart = task.startDate
    ? format(new Date(task.startDate), "dd/MM/yyyy")
    : "N/A";
  const formattedEnd = task.endDate
    ? format(new Date(task.endDate), "dd/MM/yyyy")
    : "N/A";

  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl border-l-4 p-4 shadow-sm transition hover:shadow-md",
        statusStyleMap[task.status as Status] || "border-gray-300",
      )}
      onClick={onClick}
    >
      <div className="mb-1 truncate text-base font-semibold">{task.title}</div>
      <div className="mb-2 line-clamp-2 text-sm text-muted-foreground">
        {task.description}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        <Badge variant="outline">Priority: {task.priority}</Badge>
        <Badge variant="secondary">Tag: {task.tag || "None"}</Badge>
        <Badge variant="outline">
          {task.assigneeInfo?.fullName || "Unassigned"}
        </Badge>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {formattedStart} → {formattedEnd}
      </div>
    </div>
  );
}
