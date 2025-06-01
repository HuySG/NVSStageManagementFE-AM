"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useGetAssetRequestsForManagerQuery,
  useGetCheckAvailabilityResultQuery,
  useUpdateAssetStatusMutation,
} from "@/state/api/modules/requestApi";
import { format } from "date-fns";
import ManualAssetAllocationSection from "@/components/ManualAssetAllocationSection";
import CheckAvailabilityDisplay from "@/components/CheckAvailability";
import { buildRequestedQuantitiesFromCheckResult } from "@/app/lib/utils";
import { ChevronRight, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";

const statusMap: Record<string, { label: string; color: string; bg: string }> =
  {
    PENDING_AM: {
      label: "Chờ trưởng phòng AM duyệt",
      color: "text-yellow-800",
      bg: "bg-yellow-100",
    },
    PREPARED: {
      label: "Đã chuẩn bị",
      color: "text-green-800",
      bg: "bg-green-100",
    },
    APPROVED: {
      label: "Đã duyệt",
      color: "text-blue-800",
      bg: "bg-blue-100",
    },
    REJECTED: {
      label: "Từ chối",
      color: "text-red-800",
      bg: "bg-red-100",
    },
    // Thêm các trạng thái khác nếu cần
  };

const RequestDetailPage = () => {
  const { requestId, projectId, departmentId } = useParams();
  const router = useRouter();
  const { data: allRequests = [] } = useGetAssetRequestsForManagerQuery();
  const { data: result } = useGetCheckAvailabilityResultQuery(
    requestId as string,
  );
  const { data: user } = useGetUserInfoQuery();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updateAssetStatus, { isLoading: isRejecting }] =
    useUpdateAssetStatusMutation();

  const requestedQuantities = result
    ? buildRequestedQuantitiesFromCheckResult(result)
    : {};

  const request = allRequests.find((r) => r.requestId === requestId);
  const isCategoryRequest = request && !request.asset;

  // Lấy các thông tin dự án/phòng ban để hiển thị breadcrumbs
  const projectTitle = request?.projectInfo?.title ?? "Tên dự án";
  const departmentName =
    request?.requesterInfo?.department?.name ?? "Tên phòng ban";

  if (!request) {
    return (
      <div className="p-10 text-center text-gray-400">
        Không tìm thấy yêu cầu hoặc yêu cầu đã bị xử lý.
      </div>
    );
  }

  const statusDisplay = statusMap[request.status] || {
    label: request.status,
    color: "text-gray-800",
    bg: "bg-gray-100",
  };

  // Xử lý từ chối yêu cầu
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await updateAssetStatus({
        requestId: request.requestId,
        status: "REJECTED",
        approverId: user?.id || "",
        rejectionReason,
      }).unwrap();
      toast.success("Đã từ chối yêu cầu thành công!");
      setShowRejectModal(false);
      setRejectionReason("");
      router.push("/requests");
    } catch (e) {
      toast.error("Từ chối yêu cầu thất bại.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-neutral-900">
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
        <Link
          href={`/requests/${projectId}/${departmentId}`}
          className="font-medium hover:text-blue-600"
        >
          {departmentName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-blue-700">Chi tiết yêu cầu</span>
      </nav>

      {/* Header */}
      <header className="mb-8 w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <FileText className="h-8 w-8 text-blue-500" />
              Chi tiết yêu cầu mượn tài sản
            </h1>
            <div className="mt-2 text-gray-500 dark:text-gray-400">
              {request.description ? (
                <span className="font-semibold text-gray-800 dark:text-white">
                  "{request.description}"
                </span>
              ) : (
                <span className="italic">Không có mô tả</span>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Người gửi:{" "}
              <span className="font-medium text-blue-700">
                {request.requesterInfo?.fullName}
              </span>
              {" · "}
              Ngày gửi:{" "}
              <span className="font-medium">
                {request.approvedByDLTime
                  ? format(new Date(request.approvedByDLTime), "dd/MM/yyyy")
                  : "--"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Thông tin và kiểm tra khả dụng */}
      <main className="w-full px-8 py-8">
        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow dark:bg-neutral-800">
            <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-white">
              Thông tin yêu cầu
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>
                <span className="font-semibold">Loại mượn:</span>{" "}
                <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                  {isCategoryRequest
                    ? "Theo loại/nhóm tài sản"
                    : "Tài sản cụ thể"}
                </span>
              </li>
              <li>
                <span className="font-semibold">Trạng thái:</span>{" "}
                <span
                  className={`inline-block rounded px-2 py-1 text-xs font-semibold ${statusDisplay.bg} ${statusDisplay.color}`}
                >
                  {statusDisplay.label}
                </span>
              </li>
              <li>
                <span className="font-semibold">Phòng ban:</span>{" "}
                {departmentName}
              </li>
              <li>
                <span className="font-semibold">Dự án:</span> {projectTitle}
              </li>
              <li>
                <span className="font-semibold">Mô tả:</span>{" "}
                {request.description || "--"}
              </li>
              <li>
                <span className="font-semibold">Bắt đầu:</span>{" "}
                {format(new Date(request.startTime), "dd/MM/yyyy")}
              </li>
              <li>
                <span className="font-semibold">Kết thúc:</span>{" "}
                {format(new Date(request.endTime), "dd/MM/yyyy")}
              </li>
              <li>
                <span className="font-semibold">Người duyệt:</span>{" "}
                {request.approvedByDLName}
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow dark:bg-neutral-800">
            <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-white">
              Kiểm tra khả dụng
            </h2>
            <CheckAvailabilityDisplay requestId={requestId as string} />
          </div>
        </div>

        {/* Danh sách loại/tài sản */}
        <div className="mb-10 rounded-2xl border border-gray-100 bg-white p-6 shadow dark:bg-neutral-800">
          <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-white">
            {isCategoryRequest
              ? "Các loại tài sản được yêu cầu"
              : "Tài sản được yêu cầu"}
          </h2>

          {isCategoryRequest ? (
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              {request.categories?.map((cat) => (
                <li
                  key={cat.categoryID}
                  className="rounded-md border p-3 dark:bg-neutral-900"
                >
                  <span className="font-semibold">{cat.name}</span> – Số lượng:{" "}
                  <span className="font-medium">{cat.quantity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border p-4 text-sm text-gray-700 dark:bg-neutral-900 dark:text-gray-200">
              <span className="font-semibold">{request.asset?.assetName}</span>{" "}
              ({request.asset?.code}) – {request.asset?.category?.name}
            </div>
          )}
        </div>

        {/* Manual Asset Allocation Section */}
        {isCategoryRequest && (
          <div className="mt-8">
            {result ? (
              result.availableAssets && result.availableAssets.length > 0 ? (
                <ManualAssetAllocationSection
                  requestId={requestId as string}
                  projectId={projectId as string}
                  departmentId={departmentId as string}
                  availableAssets={result.availableAssets}
                  requestedQuantities={requestedQuantities}
                />
              ) : (
                <div className="mt-6 text-sm italic text-gray-600 dark:text-gray-300">
                  Hiện tại không có tài sản nào phù hợp để phân bổ thủ công.
                </div>
              )
            ) : (
              <div className="mt-6 text-sm text-gray-400">
                Đang tải dữ liệu phân bổ...
              </div>
            )}
          </div>
        )}

        {/* Nút từ chối - chuyển sang bên trái */}
        <div className="mt-8 flex justify-start">
          {request.status === "PENDING_AM" && (
            <button
              onClick={() => setShowRejectModal(true)}
              className="rounded-lg bg-red-500 px-5 py-2 font-bold text-white shadow transition hover:bg-red-600"
            >
              Từ chối yêu cầu
            </button>
          )}
        </div>

        {/* Modal từ chối */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg dark:bg-neutral-900">
              <h3 className="mb-4 text-lg font-semibold text-red-600">
                Xác nhận từ chối yêu cầu
              </h3>
              <textarea
                className="mb-4 min-h-[80px] w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-neutral-800"
                placeholder="Nhập lý do từ chối..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  className="rounded bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                  onClick={() => setShowRejectModal(false)}
                  disabled={isRejecting}
                >
                  Huỷ
                </button>
                <button
                  className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
                  onClick={handleReject}
                  disabled={isRejecting}
                >
                  {isRejecting ? "Đang gửi..." : "Từ chối"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestDetailPage;
