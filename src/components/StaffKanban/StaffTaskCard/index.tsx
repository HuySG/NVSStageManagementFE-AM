"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Status } from "@/types/status";
import { PrepareTask } from "@/types/PrepareTask ";
import { useRouter } from "next/navigation";

interface StaffTaskCardProps {
  task: PrepareTask;
  status: Status;
  projectId: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ToDo":
      return "bg-gray-400";
    case "WorkInProgress":
      return "bg-yellow-500";
    case "UnderReview":
      return "bg-yellow-500";
    case "Completed":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
};

const StaffTaskCard: React.FC<StaffTaskCardProps> = ({
  task,
  status,
  projectId,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.taskID,
      data: { status },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const router = useRouter();

  const handleClick = () => {
    router.push(`/staff-tasks/${projectId}/${task.taskID}`);
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="cursor-pointer" onClick={handleClick}>
        <Card className="border border-gray-300 shadow-sm transition hover:border-blue-500">
          <CardContent className="relative space-y-2 p-4">
            <div
              {...listeners}
              className="absolute right-2 top-2 h-4 w-4 cursor-grab"
              onClick={(e) => e.stopPropagation()} // ngăn click kéo trigger luôn handleClick
            >
              ⠿
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold">{task.title}</h3>
              <Badge variant="outline" className="text-xs capitalize">
                {task.priority}
              </Badge>
            </div>

            <p className="line-clamp-2 text-sm text-muted-foreground">
              {task.description || "Không có mô tả"}
            </p>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Bắt đầu:{" "}
                {task.startDate
                  ? format(new Date(task.startDate), "dd/MM/yyyy")
                  : "--"}
              </span>
              <span>
                Hạn:{" "}
                {task.endDate
                  ? format(new Date(task.endDate), "dd/MM/yyyy")
                  : "--"}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div
                className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`}
              />
              <span className="text-xs capitalize text-gray-600">
                {task.status}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffTaskCard;
