"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  ClipboardList,
  Layers,
  CalendarDays,
  ListChecks,
  User,
  ChevronRight,
  Box,
  Image as ImageIcon,
  Loader2,
  Camera,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { uploadToFirebase } from "@/lib/firebase";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetPreparationDetailsQuery } from "@/state/api/modules/taskApi";
import {
  useUpdateAssetStatusMutation,
  useUploadBeforeImagesMutation,
} from "@/state/api/modules/requestApi";
import { toast } from "react-toastify";
import { useGetProjectDetailsByIdQuery } from "@/state/api/modules/projectApi";

const assetStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ phân bổ", color: "bg-yellow-100 text-yellow-700" },
  PREPARING: { label: "Đang chuẩn bị", color: "bg-blue-100 text-blue-700" },
  READY: { label: "Sẵn sàng", color: "bg-green-100 text-green-700" },
};
const requestStatusMap: Record<string, { label: string; color: string }> = {
  PARTIALLY_ALLOCATED: {
    label: "Đã phân bổ một phần",
    color: "bg-yellow-100 text-yellow-800",
  },
  PENDING: {
    label: "Chờ duyệt",
    color: "bg-yellow-100 text-yellow-800",
  },
  APPROVED: {
    label: "Đã duyệt",
    color: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Từ chối",
    color: "bg-red-100 text-red-700",
  },
  PREPARED: {
    label: "Đã chuẩn bị",
    color: "bg-blue-100 text-blue-700",
  },
};

export default function PrepareAssetDetailPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();
  const { data: user } = useGetUserInfoQuery();

  const {
    data: detail,
    isLoading,
    refetch: refetchDetail,
  } = useGetPreparationDetailsQuery(taskId as string, { skip: !taskId });

  const [uploadedMap, setUploadedMap] = useState<Record<string, string[]>>({});
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});
  const [uploadBeforeImages] = useUploadBeforeImagesMutation();
  const [updateStatus] = useUpdateAssetStatusMutation();
  const { data: projectDetails } = useGetProjectDetailsByIdQuery(
    projectId as string,
    { skip: !projectId },
  );
  const projectTitle = projectDetails?.title || projectId;
  const handleUpload = async (allocationId: string, files: FileList) => {
    setUploadingMap((prev) => ({ ...prev, [allocationId]: true }));
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToFirebase(file, allocationId);
        urls.push(url);
      }
      await uploadBeforeImages({ allocationId, imageUrls: urls });
      setUploadedMap((prev) => ({ ...prev, [allocationId]: urls }));
      setSuccessMap((prev) => ({ ...prev, [allocationId]: true }));
      refetchDetail();
      toast.success("Tải ảnh thành công!");
    } catch {
      toast.error("Có lỗi khi upload ảnh.");
    } finally {
      setUploadingMap((prev) => ({ ...prev, [allocationId]: false }));
    }
  };

  const handleRemoveUploaded = (allocationId: string, url: string) => {
    setUploadedMap((prev) => ({
      ...prev,
      [allocationId]: prev[allocationId]?.filter((item) => item !== url) ?? [],
    }));
  };

  const handleComplete = async () => {
    const requestId = detail?.request?.[0]?.requestId;
    if (!user?.id || !requestId) return;
    await updateStatus({ requestId, status: "IN_USE", approverId: user.id });
    toast.success("Đã hoàn tất chuẩn bị!");
    router.push(`/staff-tasks/${projectId}`);
  };

  const allUploaded =
    detail?.assets?.length &&
    detail.assets.every(
      (a) =>
        (a.imageUrls && a.imageUrls.length > 0) ||
        (uploadedMap[a.allocationId]?.length ?? 0) > 0,
    );

  const prepareTask = detail?.prepareTask;
  const assetList = detail?.assets ?? [];
  const requestInfo = detail?.request?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 pb-10 dark:from-slate-900 dark:via-slate-950 dark:to-gray-900">
      {/* Breadcrumb */}
      <div className="px-10 pb-2 pt-8">
        <nav className="flex items-center gap-1 text-sm text-gray-500 md:gap-2">
          <Link href="/staff-tasks" className="text-blue-700 hover:underline">
            Dự án của tôi
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/staff-tasks/${projectId}`}
            className="text-blue-700 hover:underline"
          >
            {projectTitle}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-gray-700">
            {prepareTask?.title ?? "Chuẩn bị tài sản"}
          </span>
        </nav>
      </div>

      {/* HEADER */}
      <section className="px-10">
        <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/95 p-8 shadow-lg dark:bg-slate-900/90 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-5">
            <ClipboardList className="h-11 w-11 shrink-0 text-indigo-600 dark:text-indigo-300" />
            <div className="min-w-0">
              <h1 className="mb-2 truncate text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
                {prepareTask?.title || "Chuẩn bị tài sản"}
              </h1>
              <div className="flex flex-wrap gap-6 text-[15px] font-medium text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <Layers className="h-5 w-5 opacity-70" />
                  {prepareTask?.tag ?? "Chuẩn bị"}
                </span>
                <span className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 opacity-70" />
                  Ưu tiên:{" "}
                  <span className="ml-1 font-bold">
                    {prepareTask?.priority ?? "Không xác định"}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 opacity-70" />
                  {prepareTask?.startDate
                    ? format(new Date(prepareTask.startDate), "dd/MM/yyyy")
                    : "--"}{" "}
                  &rarr;{" "}
                  {prepareTask?.endDate
                    ? format(new Date(prepareTask.endDate), "dd/MM/yyyy")
                    : "--"}
                </span>
              </div>
            </div>
          </div>
          <Badge className="rounded-2xl bg-blue-100 px-5 py-2 text-base font-bold text-blue-700 shadow-md">
            {prepareTask?.status}
          </Badge>
        </div>
      </section>

      {/* MAIN CONTENT 2 CỘT */}
      <main className="px-10 pb-16">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* LEFT: Chi tiết công việc + Thông tin yêu cầu */}
          <div className="flex min-w-[340px] flex-1 flex-col gap-6">
            {/* Chi tiết công việc chuẩn bị */}
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-200">
                <ClipboardList className="h-6 w-6" /> Chi tiết công việc chuẩn
                bị
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-white px-7 py-6 shadow dark:border-gray-800 dark:bg-slate-900">
                <InfoRow
                  label="Mô tả"
                  icon={<Box className="h-5 w-5 text-blue-400" />}
                  value={
                    prepareTask?.description || (
                      <span className="italic text-gray-400">
                        Không có mô tả
                      </span>
                    )
                  }
                />
                <InfoRow
                  label="Người chuẩn bị"
                  icon={<User className="h-5 w-5 text-indigo-400" />}
                  value={prepareTask?.assigneeInfo?.fullName || "Chưa gán"}
                />
              </div>
            </section>
            {/* Thông tin yêu cầu */}
            {requestInfo && (
              <section>
                <h2 className="mb-4 mt-2 flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-200">
                  <Package className="h-6 w-6" /> Thông tin yêu cầu mượn tài sản
                </h2>
                <div className="rounded-2xl border border-gray-100 bg-white px-7 py-6 shadow dark:border-gray-800 dark:bg-slate-900">
                  <InfoRow
                    label="Tiêu đề"
                    icon={<ClipboardList className="h-5 w-5 text-violet-400" />}
                    value={
                      <span className="font-semibold">{requestInfo.title}</span>
                    }
                  />
                  <InfoRow
                    label="Mô tả"
                    icon={<Box className="h-5 w-5 text-blue-400" />}
                    value={
                      requestInfo.description || (
                        <span className="italic text-gray-400">
                          Không có mô tả
                        </span>
                      )
                    }
                  />
                  <InfoRow
                    label="Thời gian mượn"
                    icon={<CalendarDays className="h-5 w-5 text-amber-400" />}
                    value={
                      <span>
                        {requestInfo.startTime
                          ? format(
                              new Date(requestInfo.startTime),
                              "dd/MM/yyyy",
                            )
                          : "--"}{" "}
                        &rarr;{" "}
                        {requestInfo.endTime
                          ? format(new Date(requestInfo.endTime), "dd/MM/yyyy")
                          : "--"}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Task liên quan"
                    icon={
                      <ClipboardList className="h-5 w-5 text-emerald-400" />
                    }
                    value={
                      requestInfo.task?.title || (
                        <span className="italic text-gray-400">Không có</span>
                      )
                    }
                  />
                  <InfoRow
                    label="Trạng thái"
                    icon={<ListChecks className="h-5 w-5 text-lime-400" />}
                    value={
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${requestStatusMap[requestInfo.status]?.color ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {requestStatusMap[requestInfo.status]?.label ??
                          requestInfo.status}
                      </span>
                    }
                  />
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Danh sách tài sản & upload ảnh */}
          <div className="w-full flex-shrink-0 lg:w-[500px]">
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-200">
                <ImageIcon className="h-6 w-6" /> Danh sách tài sản & Ảnh chuẩn
                bị
              </h2>
              <div className="flex flex-col gap-7">
                {isLoading ? (
                  <div className="flex items-center gap-2 py-6 text-gray-500">
                    <Loader2 className="animate-spin" /> Đang tải tài sản...
                  </div>
                ) : assetList.length === 0 ? (
                  <div className="py-4 text-gray-500">
                    Không có tài sản nào.
                  </div>
                ) : (
                  assetList.map((asset) => (
                    <div
                      key={asset.allocationId}
                      className="rounded-xl border bg-white p-5 shadow-sm"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-4 text-base font-semibold text-gray-700">
                        <span className="flex items-center gap-1">
                          <Box className="h-5 w-5 text-indigo-500" />
                          {asset.assetName}
                        </span>
                        <span className="text-xs text-gray-400">
                          (Mã: {asset.assetId})
                        </span>
                        <span className="text-xs text-gray-500">
                          Phân loại: {asset.categoryName}
                        </span>
                        <span
                          className={
                            "rounded border px-2 py-0.5 text-xs font-medium " +
                            (assetStatusMap[asset.status]?.color ||
                              "bg-gray-200 text-gray-700")
                          }
                        >
                          {assetStatusMap[asset.status]?.label || asset.status}
                        </span>
                      </div>
                      <label className="mt-1 flex items-center gap-2 text-sm font-medium">
                        <Camera className="h-4 w-4 text-blue-400" />
                        Ảnh chuẩn bị:
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={uploadingMap[asset.allocationId]}
                          onChange={(e) =>
                            e.target.files &&
                            handleUpload(asset.allocationId, e.target.files)
                          }
                          className="ml-2 flex-1 text-sm"
                        />
                      </label>
                      {uploadingMap[asset.allocationId] && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải ảnh...
                        </div>
                      )}
                      {successMap[asset.allocationId] && (
                        <div className="mt-1 text-sm font-semibold text-green-600">
                          Đã lưu thành công
                        </div>
                      )}
                      {/* Ảnh đã lưu */}
                      {asset.imageUrls?.length! > 0 && (
                        <div className="mt-3">
                          <div className="mb-1 text-xs font-semibold text-gray-500">
                            Ảnh đã lưu:
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                            {asset.imageUrls!.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={url}
                                  alt={`Ảnh đã chuẩn bị ${i + 1}`}
                                  className="h-28 w-full rounded border object-cover transition hover:scale-105"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Ảnh vừa upload */}
                      {uploadedMap[asset.allocationId]?.length > 0 && (
                        <div className="mt-3">
                          <div className="mb-1 text-xs font-semibold text-green-600">
                            Ảnh vừa upload:
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                            {uploadedMap[asset.allocationId].map((url, i) => (
                              <div key={i} className="group relative">
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <img
                                    src={url}
                                    alt={`Ảnh mới ${i + 1}`}
                                    className="h-28 w-full rounded border object-cover transition hover:scale-105"
                                  />
                                </a>
                                <button
                                  onClick={() =>
                                    handleRemoveUploaded(
                                      asset.allocationId,
                                      url,
                                    )
                                  }
                                  className="absolute right-1 top-1 hidden rounded-full bg-red-600 px-2 py-0.5 text-xs text-white group-hover:block"
                                  title="Xoá ảnh"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              {/* Nút hoàn tất */}
              <div className="flex flex-col items-center pt-6">
                <button
                  className="rounded-xl bg-indigo-600 px-10 py-3 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-60"
                  disabled={Object.values(uploadingMap).some(Boolean)}
                  onClick={handleComplete}
                >
                  Hoàn tất chuẩn bị
                </button>
                {!allUploaded && (
                  <div className="mt-3 text-center text-sm text-yellow-500">
                    Một số tài sản chưa upload ảnh chuẩn bị!
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

// Hàng thông tin (Label, icon, value)
function InfoRow({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="pt-1">{icon}</div>
      <div>
        <div className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="text-[16px] font-normal text-gray-900 dark:text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
