"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Search, ListChecks } from "lucide-react";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";

const RequestProjectPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data = [],
    isLoading,
    isError,
  } = useGetAssetRequestsForManagerQuery();

  // Pending requests
  const pendingRequests: AssetRequest[] = useMemo(
    () => data.filter((r) => r.status === "PENDING_AM"),
    [data],
  );

  // Project grouping
  const grouped = useMemo(
    () =>
      pendingRequests.reduce(
        (acc, request) => {
          const id = request.projectInfo?.projectID ?? "unknown";
          const title = request.projectInfo?.title ?? "Dự án chưa xác định";
          if (!acc[id]) acc[id] = { projectTitle: title, count: 0 };
          acc[id].count += 1;
          return acc;
        },
        {} as Record<string, { projectTitle: string; count: number }>,
      ),
    [pendingRequests],
  );

  // Filter by search
  const filteredProjects = useMemo(
    () =>
      Object.entries(grouped).filter(([_, { projectTitle }]) =>
        projectTitle.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [grouped, searchQuery],
  );

  // Lấy danh sách tên phòng ban không trùng
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    const names: string[] = [];
    pendingRequests.forEach((req) => {
      const depId = req.requesterInfo?.department?.id;
      const depName = req.requesterInfo?.department?.name;
      if (depId && !set.has(depId)) {
        set.add(depId);
        if (depName) names.push(depName);
      }
    });
    return { count: set.size, names };
  }, [pendingRequests]);

  const totalProjects = Object.keys(grouped).length;
  const totalPending = pendingRequests.length;

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">Đang tải yêu cầu...</div>
    );
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải danh sách yêu cầu.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <ListChecks className="h-8 w-8 text-blue-500" />
              Yêu cầu mượn tài sản theo dự án
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Danh sách các dự án có yêu cầu mượn tài sản chờ duyệt.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Tên các phòng ban gửi yêu cầu */}
            <div className="mt-4">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tổng phòng ban gửi yêu cầu:&nbsp;
                <span className="text-lg font-bold text-green-600">
                  {uniqueDepartments.count}
                </span>
              </span>
              {uniqueDepartments.names.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {uniqueDepartments.names.map((name) => (
                    <span
                      key={name}
                      className="rounded border border-green-100 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Thống kê tổng dự án và yêu cầu */}
          <div className="flex flex-col items-start gap-2 md:items-end md:gap-2">
            <span className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng dự án:&nbsp;
              <span className="text-lg font-bold text-blue-600">
                {totalProjects}
              </span>
            </span>
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng yêu cầu chờ duyệt:&nbsp;
              <span className="text-lg font-bold text-yellow-600">
                {totalPending}
              </span>
            </span>
          </div>
        </div>
      </header>

      <main className="w-full px-8 py-10">
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có dự án nào có yêu cầu chờ duyệt.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProjects.map(([projectId, { projectTitle, count }]) => (
              <Link
                key={projectId}
                href={`/requests/${projectId}`}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100 dark:bg-blue-900">
                  <Briefcase className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
                </div>
                <div className="mb-2 line-clamp-2 min-h-[48px] break-words text-lg font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                  {projectTitle}
                </div>
                <span className="mt-1 inline-block rounded-full bg-yellow-200 px-4 py-1.5 text-sm font-semibold text-yellow-800 shadow-sm">
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

export default RequestProjectPage;
