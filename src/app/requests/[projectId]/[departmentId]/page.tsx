"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";
import { FileText, ChevronRight } from "lucide-react";
import { format } from "date-fns";

const DepartmentRequestsPage = () => {
  const { projectId, departmentId } = useParams();
  const {
    data: allRequests = [],
    isLoading,
    isError,
  } = useGetAssetRequestsForManagerQuery();

  // Lọc danh sách yêu cầu theo project, department và status
  const requests: AssetRequest[] = allRequests.filter(
    (r) =>
      r.status === "PENDING_AM" &&
      r.projectInfo?.projectID === projectId &&
      r.requesterInfo?.department?.id === departmentId,
  );

  // Lấy tên dự án, tên phòng ban để hiện breadcrumbs & header
  const projectTitle = requests[0]?.projectInfo?.title ?? "Tên dự án";
  const departmentName =
    requests[0]?.requesterInfo?.department?.name ?? "Tên phòng ban";

  // Loading & error
  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">Đang tải yêu cầu...</div>
    );

  if (isError)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu.
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
        <Link
          href={`/requests/${projectId}`}
          className="font-medium hover:text-blue-600"
        >
          {projectTitle}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-blue-700">{departmentName}</span>
      </nav>

      {/* Header */}
      <header className="mb-8 w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
            Danh sách yêu cầu chờ duyệt của phòng ban
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Kiểm tra và xử lý các yêu cầu mượn tài sản đang chờ duyệt của phòng
            ban{" "}
            <span className="font-semibold text-blue-700">
              {departmentName}
            </span>
            .
          </p>
        </div>
      </header>

      {/* Grid yêu cầu */}
      <main className="w-full px-8 py-8">
        {requests.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có yêu cầu nào đang chờ duyệt.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {requests.map((r) => (
              <div
                key={r.requestId}
                className="group flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-3 flex items-start gap-4">
                  <div className="rounded-full bg-green-50 p-4 text-green-700 dark:bg-green-900">
                    <FileText className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="line-clamp-2 text-lg font-semibold text-gray-800 group-hover:text-blue-700 dark:text-white">
                      {r.description || "Yêu cầu không tiêu đề"}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {r.asset
                          ? "Mượn tài sản cụ thể"
                          : "Mượn theo loại/nhóm"}
                      </span>
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800">
                        Người gửi: {r.requesterInfo?.fullName}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-end justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {r.approvedByDLTime
                      ? "Duyệt bởi trưởng bộ phận: " +
                        format(new Date(r.approvedByDLTime), "dd/MM/yyyy")
                      : "Chưa được duyệt bởi trưởng bộ phận"}
                  </div>
                  <Link
                    href={`/requests/${projectId}/${departmentId}/${r.requestId}`}
                    className="ml-2 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DepartmentRequestsPage;
