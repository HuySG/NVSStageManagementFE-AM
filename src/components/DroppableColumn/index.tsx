import { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Status } from "@/types/status";

interface DroppableColumnProps {
  status: Status;
  children: ReactNode;
}

export default function DroppableColumn({
  status,
  children,
}: DroppableColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[80px] rounded-xl bg-gray-100 p-4 shadow-md"
    >
      {children}
    </div>
  );
}
