"use client";

import { useGetPendingReturnRequestsQuery } from "@/state/api/modules/returnRequestApi";
import { useGetUsersQuery } from "@/state/api/modules/userApi";
import Link from "next/link";
import { useMemo } from "react";

export default function DepartmentListPage() {
  const { data: requests, isLoading: loadingRequests } =
    useGetPendingReturnRequestsQuery();
  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();

  const departments = useMemo(() => {
    if (!requests || !users) return [];

    const staffIds = new Set(requests.map((req) => req.staffId));
    const relevantUsers = users.filter((user) => staffIds.has(user.id));

    const departmentMap = new Map<
      string,
      { id: string; name: string; count: number }
    >();
    relevantUsers.forEach((user) => {
      if (user.department) {
        const existing = departmentMap.get(user.department.id);
        if (existing) {
          existing.count += 1;
        } else {
          departmentMap.set(user.department.id, {
            id: user.department.id,
            name: user.department.name,
            count: 1,
          });
        }
      }
    });

    return Array.from(departmentMap.values());
  }, [requests, users]);

  if (loadingRequests || loadingUsers)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="p-8">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Phòng ban có yêu cầu trả
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Chọn phòng ban để xem các yêu cầu trả tài sản của nhân viên.
        </p>
        <p className="mt-1 text-sm font-semibold text-indigo-600">
          Tổng phòng ban: {departments.length}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Link key={dept.id} href={`/return-request/${dept.id}`}>
            <div className="cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition hover:bg-blue-50 hover:shadow-md">
              <h2 className="text-lg font-semibold text-gray-800">
                {dept.name}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {dept.count} nhân viên có yêu cầu trả
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
