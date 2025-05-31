"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { AssetRequest } from "@/types/assetRequest";

const BorrowedAssetDepartmentsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const {
    data: borrowedAssets = [],
    isLoading,
    isError,
  } = useGetBorrowedAssetsQuery();
  const { data: assetRequests = [] } = useGetAssetRequestsForManagerQuery();

  // Build taskID -> request map
  const requestMap: Record<string, AssetRequest> = {};
  assetRequests.forEach((request) => {
    if (request.task?.taskID) {
      requestMap[request.task.taskID] = request;
    }
  });

  // Tìm tên dự án (nếu có)
  const projectName =
    assetRequests.find((r) => r.projectInfo?.projectID === projectId)
      ?.projectInfo?.title || "Dự án";

  // Filter borrowed assets by projectId and not returned
  const filteredAssets = useMemo(
    () =>
      borrowedAssets.filter((asset) => {
        const request = requestMap[asset.taskID];
        return (
          request?.projectInfo?.projectID === projectId &&
          asset.status !== "RETURNED"
        );
      }),
    [borrowedAssets, requestMap, projectId],
  );

  // Group by department
  const departmentsMap: Record<
    string,
    { departmentName: string; count: number }
  > = {};
  filteredAssets.forEach((asset) => {
    const request = requestMap[asset.taskID];
    if (!request) return;
    const deptId = request.requesterInfo?.department?.id ?? "unknown";
    const deptName =
      request.requesterInfo?.department?.name ?? "Phòng ban chưa xác định";
    if (!departmentsMap[deptId]) {
      departmentsMap[deptId] = { departmentName: deptName, count: 0 };
    }
    departmentsMap[deptId].count += 1;
  });

  const departments = Object.entries(departmentsMap);

  // Thống kê tổng
  const totalDepartments = departments.length;
  const totalAssets = filteredAssets.length;

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">
        Đang tải dữ liệu phòng ban...
      </div>
    );
  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 px-8 pb-1 pt-6 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/borrowAssets"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          Dự án mượn tài sản
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-gray-700 dark:text-white">
          {projectName}
        </span>
      </div>

      {/* HEADER */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <Building2 className="h-8 w-8 text-blue-500" />
              Phòng ban đang mượn tài sản
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Danh sách các phòng ban thuộc dự án này đang có tài sản được mượn.
            </p>
            {/* Danh sách phòng ban (badge) */}
            <div className="mt-4">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tổng số phòng ban mượn:&nbsp;
                <span className="text-lg font-bold text-green-600">
                  {totalDepartments}
                </span>
              </span>
              {departments.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {departments.map(([, { departmentName }]) => (
                    <span
                      key={departmentName}
                      className="rounded border border-green-100 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                    >
                      {departmentName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Thống kê */}
          <div className="flex flex-col items-start gap-2 md:items-end md:gap-2">
            <span className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng tài sản đang mượn:&nbsp;
              <span className="text-lg font-bold text-yellow-600">
                {totalAssets}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* GRID danh sách phòng ban */}
      <main className="w-full px-8 py-10">
        {departments.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có phòng ban nào đang mượn tài sản trong dự án này.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {departments.map(([deptId, { departmentName, count }]) => (
              <Link
                key={deptId}
                href={`/borrowAssets/${projectId}/${deptId}`}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100 dark:bg-blue-900">
                  <Building2 className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
                </div>
                <div className="mb-2 line-clamp-2 min-h-[48px] break-words text-lg font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                  {departmentName}
                </div>
                <span className="inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-800 shadow-sm">
                  {count} tài sản đang mượn
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BorrowedAssetDepartmentsPage;
