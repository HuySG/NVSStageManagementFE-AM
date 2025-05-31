"use client";

import { useParams } from "next/navigation";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { useGetAssetByIdQuery } from "@/state/api/modules/assetApi";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useGetUsageHistoryByAssetQuery } from "@/state/api/modules/allocationApi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronLeft, ChevronRight, Box } from "lucide-react";

// Hàm chuyển trạng thái sang tiếng Việt & màu sắc badge
const statusMap: Record<string, { label: string; color: string }> = {
  BORROWED: {
    label: "Đang mượn",
    color: "bg-yellow-100 text-yellow-700 border-yellow-400",
  },
  IN_USE: {
    label: "Đang sử dụng",
    color: "bg-blue-100 text-blue-700 border-blue-400",
  },
  RETURNED: {
    label: "Đã trả",
    color: "bg-green-100 text-green-700 border-green-500",
  },
  LOST: { label: "Mất", color: "bg-red-100 text-red-700 border-red-400" },
  DEFAULT: {
    label: "Không xác định",
    color: "bg-gray-100 text-gray-500 border-gray-300",
  },
};

const BorrowedAssetDetailPage = () => {
  const { projectId, departmentId, borrowedID } = useParams<{
    projectId: string;
    departmentId: string;
    borrowedID: string;
  }>();

  const { data: borrowedAssets = [] } = useGetBorrowedAssetsQuery();
  const { data: assetRequests = [] } = useGetAssetRequestsForManagerQuery();

  // Build taskID -> request map
  const requestMap: Record<string, any> = {};
  assetRequests?.forEach((request) => {
    if (request.task?.taskID) {
      requestMap[request.task.taskID] = request;
    }
  });

  const asset = borrowedAssets.find(
    (a) => (a.borrowedID || a.borrowedID) === borrowedID,
  );
  const assetId = asset?.assetID;
  const { data: assetDetail, isLoading: isLoadingAsset } = useGetAssetByIdQuery(
    assetId!,
    { skip: !assetId },
  );
  const { data: usageHistory = [], isLoading: isLoadingHistory } =
    useGetUsageHistoryByAssetQuery(assetId!, { skip: !assetId });
  const request = asset ? requestMap[asset.taskID] : undefined;
  const borrower = request?.requesterInfo?.fullName ?? "Không rõ";
  const taskTitle = request?.task?.title ?? "Không rõ";
  const assetName = assetDetail?.assetName ?? "Không rõ";
  const assetCategory = assetDetail?.category?.name ?? "--";
  const assetType = assetDetail?.assetType?.name ?? "--";
  const projectName =
    assetRequests?.find((r) => r.projectInfo?.projectID === projectId)
      ?.projectInfo?.title ?? "Dự án";

  // Xử lý trạng thái cho badge
  const statusBadge = statusMap[asset?.status || ""] || statusMap.DEFAULT;

  if (!asset) {
    return (
      <div className="p-8 text-center text-gray-500">
        Không tìm thấy tài sản.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-8 dark:bg-neutral-900">
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 px-4 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/borrowAssets"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          Dự án mượn tài sản
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/borrowAssets/${projectId}`}
          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          {projectName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/borrowAssets/${projectId}/${departmentId}`}
          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          Phòng ban
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-gray-700 dark:text-white">
          Chi tiết tài sản
        </span>
      </div>

      {/* Header */}
      <header className="mb-8 flex flex-col items-start gap-2 rounded-2xl border-b border-gray-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-blue-100 p-4 dark:bg-blue-900">
            <Box className="h-7 w-7 text-blue-500 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {assetName}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Mã tài sản:{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {assetId}
              </span>
            </p>
          </div>
        </div>
        <Badge
          className={`border text-base font-semibold ${statusBadge.color} mt-4 md:mt-0`}
          variant="outline"
        >
          {statusBadge.label}
        </Badge>
      </header>

      {/* Main Info */}
      <div className="mb-8 grid grid-cols-1 gap-6 rounded-xl border bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:grid-cols-2">
        <div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">Tên tài sản:</span>
            <div className="mt-1 text-base text-gray-800 dark:text-white">
              {isLoadingAsset ? "Đang tải..." : assetName}
            </div>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">Loại tài sản:</span>
            <div className="mt-1">{assetCategory}</div>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">Kiểu tài sản:</span>
            <div className="mt-1">{assetType}</div>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">Mô tả:</span>
            <div className="mt-1">
              {assetDetail?.description || "Không có mô tả"}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">Người mượn:</span>
            <div className="mt-1">{borrower}</div>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">
              Công việc liên quan:
            </span>
            <div className="mt-1">{taskTitle}</div>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">Thời gian mượn:</span>
            <div className="mt-1">
              {format(new Date(asset.borrowTime), "dd/MM/yyyy HH:mm")}
            </div>
          </div>
          <div className="mb-4">
            <span className="font-medium text-gray-500">
              Thời gian sử dụng:
            </span>
            <div className="mt-1">
              {format(new Date(asset.borrowTime), "dd/MM/yyyy")} -{" "}
              {format(new Date(asset.endTime), "dd/MM/yyyy")}
            </div>
          </div>
        </div>
      </div>

      {/* Lịch sử sử dụng tài sản */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="usage-history">
            <AccordionTrigger>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Lịch sử sử dụng tài sản
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              {isLoadingHistory ? (
                <p className="mt-2 text-sm text-gray-500">
                  Đang tải lịch sử...
                </p>
              ) : usageHistory.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  Không có lịch sử sử dụng.
                </p>
              ) : (
                <ul className="mt-4 space-y-4 text-sm text-gray-700 dark:text-gray-200">
                  {usageHistory.map((history) => {
                    const badge =
                      statusMap[history.status] || statusMap.DEFAULT;
                    return (
                      <li
                        key={history.usageID}
                        className="border-l-4 border-blue-500 pl-4"
                      >
                        <p>
                          <strong>Dự án:</strong>{" "}
                          {history.projectName ?? "Không rõ"}
                        </p>
                        <p>
                          <strong>Thời gian:</strong>{" "}
                          {format(new Date(history.startDate), "dd/MM/yyyy")} –{" "}
                          {format(new Date(history.endDate), "dd/MM/yyyy")}
                        </p>
                        <p className="flex items-center gap-2">
                          <strong>Trạng thái:</strong>
                          <Badge
                            variant="outline"
                            className={`border ${badge.color}`}
                          >
                            {badge.label}
                          </Badge>
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default BorrowedAssetDetailPage;
