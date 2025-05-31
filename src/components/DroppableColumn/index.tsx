import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Status } from "@/types/status";

interface DroppableColumnProps {
  status: Status;
  children: ReactNode;
  className?: string; // thêm dòng này
}

export default function DroppableColumn({
  status,
  children,
  className, // thêm dòng này
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-xl p-4 shadow-md ${className || "bg-gray-100"}`}
    >
      {children}
    </div>
  );
}
