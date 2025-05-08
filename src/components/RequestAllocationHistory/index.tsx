"use client";

import { useGetAllocationsByRequestIdQuery } from "@/state/api/modules/allocationApi";
import { format } from "date-fns";

export default function RequestAllocationHistory({
  requestId,
}: {
  requestId: string;
}) {
  const {
    data: allocations,
    isLoading,
    error,
  } = useGetAllocationsByRequestIdQuery(requestId);

  if (isLoading)
    return <p className="text-sm text-gray-500">Đang tải lịch sử sử dụng...</p>;
  if (error)
    return (
      <p className="text-sm text-red-500">Không thể tải dữ liệu phân bổ.</p>
    );
  if (!allocations?.length)
    return <p className="text-sm text-gray-500">Không có dữ liệu phân bổ.</p>;

  return (
    <div className="mt-6 space-y-6">
      {allocations.map((allocation) => (
        <div
          key={allocation.allocationId}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <h3 className="mb-2 text-lg font-semibold text-gray-800">
            {allocation.assetName}{" "}
            <span className="text-sm text-gray-500">
              ({allocation.categoryName})
            </span>
          </h3>

          {allocation.usageHistory?.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {allocation.usageHistory.map((history) => (
                <li
                  key={history.usageID}
                  className="border-l-4 border-blue-500 pl-4"
                >
                  <p>
                    <strong>Dự án:</strong> {history.projectName ?? "Không rõ"}
                  </p>
                  <p>
                    <strong>Thời gian:</strong>{" "}
                    {format(new Date(history.startDate), "dd/MM/yyyy")} →{" "}
                    {format(new Date(history.endDate), "dd/MM/yyyy")}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {history.status}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Chưa có lịch sử sử dụng.</p>
          )}
        </div>
      ))}
    </div>
  );
}
