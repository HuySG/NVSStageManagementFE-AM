import { useDroppable } from "@dnd-kit/core";
import { Status } from "@/types/status";

const StaffDroppableColumn = ({
  children,
  status,
}: {
  children: React.ReactNode;
  status: Status;
}) => {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div
      ref={setNodeRef}
      className="min-h-[300px] rounded border bg-gray-50 p-3"
    >
      {children}
    </div>
  );
};

export default StaffDroppableColumn;
