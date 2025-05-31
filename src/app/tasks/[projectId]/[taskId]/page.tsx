"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  Edit2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetUserInfoQuery,
  useGetUserByDepartmentQuery,
} from "@/state/api/modules/userApi";
import {
  useUpdateTaskMutation,
  useGetTaskByIdQuery,
  useGetPreparationDetailsQuery,
} from "@/state/api/modules/taskApi";
import { useUploadBeforeImagesMutation } from "@/state/api/modules/requestApi";
import { useGetProjectDetailsByIdQuery } from "@/state/api/modules/projectApi";
import { uploadToFirebase } from "@/lib/firebase";
import { toast } from "react-toastify";

export default function EditTaskPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();

  const { data: currentUser } = useGetUserInfoQuery();
  const { data: task, refetch: refetchTask } = useGetTaskByIdQuery(
    taskId as string,
    { skip: !taskId },
  );
  const { data: project } = useGetProjectDetailsByIdQuery(projectId as string, {
    skip: !projectId,
  });
  const {
    data: detail,
    isLoading,
    refetch: refetchDetail,
  } = useGetPreparationDetailsQuery(taskId as string, { skip: !taskId });
  const { data: departmentUsers = [] } = useGetUserByDepartmentQuery(
    currentUser?.department?.id!,
    { skip: !currentUser?.department?.id },
  );

  useEffect(() => {
    const onFocus = () => refetchTask();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // State cho form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [uploadedMap, setUploadedMap] = useState<Record<string, string[]>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});

  const [updateTask] = useUpdateTaskMutation();
  const [uploadBeforeImages] = useUploadBeforeImagesMutation();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setAssigneeId(task.assigneeID);
    }
  }, [task]);

  const handleUpdate = async () => {
    if (!task) return;
    await updateTask({
      ...task,
      title,
      description,
      assigneeID: assigneeId,
      updateBy: currentUser?.id || "SYSTEM",
      updateDate: new Date().toISOString(),
    });
    toast.success("Cập nhật task thành công!");
  };

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

  const prepareTask = detail?.prepareTask || task;
  const assetList = detail?.assets ?? [];
  const requestInfo = detail?.request?.[0];

  if (!task || isLoading) {
    return (
      <div className="p-8 text-center text-gray-600">
        <Loader2 className="mx-auto mb-2 animate-spin" />
        Đang tải dữ liệu task...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 pb-10 dark:from-slate-900 dark:via-slate-950 dark:to-gray-900">
      {/* Breadcrumb */}
      <div className="px-10 pb-2 pt-8">
        <nav className="flex items-center gap-1 text-sm text-gray-500 md:gap-2">
          <Link href="/tasks" className="text-blue-700 hover:underline">
            Danh sách dự án
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/tasks/${projectId}`}
            className="text-blue-700 hover:underline"
          >
            {project?.title || projectId}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-gray-700">{task.title}</span>
        </nav>
      </div>

      {/* HEADER */}
      <section className="px-10">
        <div className="mb-8 flex flex-col gap-6 rounded-2xl bg-white/95 p-8 shadow-lg dark:bg-slate-900/90 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-5">
            <Edit2 className="h-10 w-10 shrink-0 text-indigo-600 dark:text-indigo-300" />
            <div className="min-w-0">
              <h1 className="mb-2 truncate text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
                Chỉnh sửa Task: {task.title}
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
            {prepareTask?.status || task.status}
          </Badge>
        </div>
      </section>

      {/* MAIN CONTENT 2 CỘT */}
      <main className="px-10 pb-16">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* LEFT: Form chỉnh sửa Task */}
          <div className="flex min-w-[340px] flex-1 flex-col gap-6">
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-200">
                <Edit2 className="h-6 w-6" /> Thông tin Task
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-white px-7 py-6 shadow dark:border-gray-800 dark:bg-slate-900">
                <div className="mb-5">
                  <Label className="block text-gray-600">Tiêu đề</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="mb-5">
                  <Label className="block text-gray-600">Người phụ trách</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn người phụ trách" />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="block text-gray-600">Mô tả</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 min-h-[100px]"
                  />
                </div>
              </div>
            </section>

            {/* Thông tin yêu cầu */}
            {requestInfo && (
              <section>
                <h2 className="mb-4 mt-2 flex items-center gap-2 text-lg font-bold text-indigo-600 dark:text-indigo-200">
                  <ClipboardList className="h-6 w-6" /> Thông tin yêu cầu mượn
                  tài sản
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
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {requestInfo.status}
                      </span>
                    }
                  />
                </div>
              </section>
            )}

            {/* Nút lưu */}
            <div className="flex justify-end pt-3">
              <Button
                className="rounded-xl bg-indigo-600 px-10 py-2 text-lg font-semibold text-white shadow-md transition hover:bg-indigo-700"
                onClick={handleUpdate}
              >
                Lưu thay đổi
              </Button>
            </div>
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
