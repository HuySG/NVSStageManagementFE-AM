import { useDroppable } from "@dnd-kit/core";
import { Status } from "@/types/status";

const StaffDroppableColumn = ({
  children,
  status,
  className = "",
}: {
  children: React.ReactNode;
  status: Status;
  className?: string;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} transition-all duration-100 ${
        isOver ? "bg-blue-50/80 ring-2 ring-blue-400 dark:bg-blue-900/30" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default StaffDroppableColumn;
