"use client";

import { Task } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Circle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "ToDo":
      return "bg-gray-400";
    case "WorkInProgress":
      return "bg-yellow-500";
    case "UnderReview":
      return "bg-blue-500";
    case "Completed":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
};

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="relative cursor-pointer border border-gray-300 shadow-sm hover:border-primary">
      {/* Icon ba chấm với Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute right-2 top-2 z-10 rounded p-1 hover:bg-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={18} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="z-20 w-28">
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="text-red-500"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CardContent className="cursor-pointer space-y-2 p-4" onClick={onClick}>
        <div className="flex items-center justify-between pr-6">
          <h3 className="text-md font-semibold">{task.title}</h3>
          <Badge variant="outline" className="text-xs capitalize">
            {task.priority}
          </Badge>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {task.description || "No description"}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Start:{" "}
            {task.startDate
              ? format(new Date(task.startDate), "dd/MM/yyyy")
              : "--"}
          </span>
          <span>
            Due:{" "}
            {task.endDate ? format(new Date(task.endDate), "dd/MM/yyyy") : "--"}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Circle
            className={`${getStatusColor(task.status)} h-3 w-3 rounded-full`}
          />
          <span className="text-xs capitalize text-gray-600">
            {task.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
