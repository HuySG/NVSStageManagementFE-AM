"use client";

import { useGetPendingReturnRequestsQuery } from "@/state/api/modules/returnRequestApi";
import { useGetUsersQuery } from "@/state/api/modules/userApi";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

export default function DepartmentListPage() {
  const { departmentId } = useParams();
  const router = useRouter();

  const { data: requests, isLoading: loadingRequests } =
    useGetPendingReturnRequestsQuery();
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();

  const filteredRequests = useMemo(() => {
    if (!requests || !users) return [];

    const userMap = new Map(users.map((u) => [u.id, u]));
    return requests.filter((req) => {
      const user = userMap.get(req.staffId);
      return user?.department?.id === departmentId;
    });
  }, [requests, users, departmentId]);

  if (loadingRequests || loadingUsers) {
    return (
      <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 px-10 py-10 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Yêu cầu trả tài sản
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Danh sách các yêu cầu trả tài sản thuộc phòng ban này.
        </p>
        <p className="mt-2 text-sm font-medium text-indigo-600">
          Tổng yêu cầu: {filteredRequests.length}
        </p>
      </div>

      {/* Grid layout */}
      {filteredRequests.length === 0 ? (
        <div className="text-center text-gray-500">Không có yêu cầu nào.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {filteredRequests.map((req) => (
            <div
              key={req.requestId}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              onClick={() =>
                router.push(`/return-request/${departmentId}/${req.requestId}`)
              }
            >
              <div className="flex flex-col gap-3">
                {req.imageUrl ? (
                  <img
                    src={req.imageUrl}
                    alt="Hình ảnh trả"
                    className="h-40 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
                    Không có hình ảnh
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">
                    Mã yêu cầu:{" "}
                    <span className="font-medium text-gray-700">
                      {req.requestId.slice(0, 8)}...
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Thời gian:{" "}
                    <span className="text-gray-700">
                      {new Date(req.requestTime).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
