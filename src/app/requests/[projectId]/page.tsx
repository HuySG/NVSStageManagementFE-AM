"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";
import { Building2, ListChecks, Search, ChevronRight } from "lucide-react";

const ProjectDepartmentsPage = () => {
  const { projectId } = useParams();
  const [search, setSearch] = useState("");

  const {
    data: allRequests = [],
    isLoading,
    isError,
  } = useGetAssetRequestsForManagerQuery();

  // Hooks (đặt trên đầu, tránh lỗi rules)
  const requests: AssetRequest[] = useMemo(
    () =>
      allRequests.filter(
        (r) =>
          r.status === "PENDING_AM" && r.projectInfo?.projectID === projectId,
      ),
    [allRequests, projectId],
  );

  // Lấy tên dự án từ 1 request (nếu có)
  const projectTitle = requests[0]?.projectInfo?.title ?? "Tên dự án";

  const departments = useMemo(() => {
    const map: Record<string, { departmentName: string; count: number }> = {};
    requests.forEach((r) => {
      const deptId = r.requesterInfo?.department?.id ?? "unknown";
      const deptName = r.requesterInfo?.department?.name ?? "Không xác định";
      if (!map[deptId]) {
        map[deptId] = { departmentName: deptName, count: 0 };
      }
      map[deptId].count += 1;
    });
    return Object.entries(map).filter(([_, { departmentName }]) =>
      departmentName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [requests, search]);

  const totalDepartments = departments.length;
  const totalRequests = requests.length;

  // Loading & error
  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">
        Đang tải danh sách phòng ban...
      </div>
    );
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu phòng ban.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 px-8 pb-2 pt-6 text-sm text-gray-500 dark:text-gray-300">
        <Link
          href="/requests"
          className="flex items-center gap-1 font-medium hover:text-blue-600"
        >
          Danh sách dự án
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium hover:text-blue-600">{projectTitle}</span>
      </nav>
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <ListChecks className="h-8 w-8 text-blue-500" />
              Phòng ban có yêu cầu mượn tài sản
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Quản lý các phòng ban gửi yêu cầu mượn tài sản trong dự án này.
            </p>
            {/* Search phòng ban */}
            <div className="mt-4 flex items-center gap-2">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm phòng ban..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Thống kê tổng số phòng ban và request */}
            <div className="mt-4 flex gap-5">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tổng phòng ban:&nbsp;
                <span className="text-lg font-bold text-green-600">
                  {totalDepartments}
                </span>
              </span>
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tổng yêu cầu:&nbsp;
                <span className="text-lg font-bold text-yellow-600">
                  {totalRequests}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>
      {/* Grid phòng ban */}
      <main className="w-full px-8 py-10">
        {departments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có phòng ban nào có yêu cầu chờ duyệt.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {departments.map(([deptId, { departmentName, count }]) => (
              <Link
                key={deptId}
                href={`/requests/${projectId}/${deptId}`}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-7 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-full bg-blue-50 p-4 transition group-hover:bg-blue-100 dark:bg-blue-900">
                    <Building2 className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
                  </div>
                  <h2 className="break-words text-lg font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                    {departmentName}
                  </h2>
                </div>
                <span className="mt-2 inline-block rounded-full bg-yellow-200 px-4 py-1.5 text-sm font-semibold text-yellow-800 shadow-sm">
                  {count} yêu cầu chờ duyệt
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDepartmentsPage;
