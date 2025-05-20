"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";
import { toast } from "react-toastify";

export default function EditTaskPage() {
  const { projectId, taskId } = useParams();
  const router = useRouter();

  const { data: currentUser } = useGetUserInfoQuery();
  const { data: task, refetch: refetchTask } = useGetTaskByIdQuery(
    taskId as string,
    {
      skip: !taskId,
    },
  );
  const { data: project } = useGetProjectDetailsByIdQuery(projectId as string, {
    skip: !projectId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: detail,
    isLoading,
    refetch: refetchDetail,
  } = useGetPreparationDetailsQuery(taskId as string, {
    skip: !taskId,
    refetchOnMountOrArgChange: true,
  });

  const { data: departmentUsers = [] } = useGetUserByDepartmentQuery(
    currentUser?.department?.id!,
    {
      skip: !currentUser?.department?.id,
    },
  );
  useEffect(() => {
    const onFocus = () => {
      refetchTask();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [uploading, setUploading] = useState(false);
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
    setUploading(true);
    const urls: string[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadToFirebase(file, allocationId);
      urls.push(url);
    }

    await uploadBeforeImages({ allocationId, imageUrls: urls });
    setUploadedMap((prev) => ({ ...prev, [allocationId]: urls }));
    setSuccessMap((prev) => ({ ...prev, [allocationId]: true }));
    refetchDetail();
    setUploading(false);
  };

  const handleRemoveUploaded = (allocationId: string, url: string) => {
    setUploadedMap((prev) => ({
      ...prev,
      [allocationId]: prev[allocationId].filter((item) => item !== url),
    }));
  };

  if (!task || isLoading) {
    return <div className="p-6 text-gray-600">Đang tải dữ liệu task...</div>;
  }

  return (
    <div className="min-h-screen bg-white px-8 py-10">
      <Breadcrumb
        items={[
          { label: "Projects", href: "/tasks" },
          {
            label: project?.title || "Project",
            href: `/tasks/${projectId}?updated=true`,
          },
          { label: task.title || "Task" },
        ]}
      />

      <h1 className="mt-4 text-3xl font-bold text-gray-800">{task.title}</h1>

      {/* Thông tin yêu cầu */}
      {detail?.request?.map((r) => (
        <div
          key={r.requestId}
          className="mt-6 grid grid-cols-1 gap-6 text-sm text-gray-700 md:grid-cols-2"
        >
          <div>
            <p className="font-medium text-gray-500">Tiêu đề yêu cầu:</p>
            <p>{r.title}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Mô tả:</p>
            <p>{r.description}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Thời gian:</p>
            <p>
              {format(new Date(r.startTime), "dd/MM/yyyy")} –{" "}
              {format(new Date(r.endTime), "dd/MM/yyyy")}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Trạng thái:</p>
            <Badge variant="outline">{r.status}</Badge>
          </div>
        </div>
      ))}

      {/* Form chỉnh sửa task */}
      <div className="mt-10 grid grid-cols-1 gap-6 text-sm text-gray-700 md:grid-cols-2">
        <div>
          <Label className="text-gray-600">Tiêu đề Task</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-gray-600">Người phụ trách</Label>
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
        <div className="md:col-span-2">
          <Label className="text-gray-600">Mô tả Task</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 min-h-[120px]"
          />
        </div>
      </div>

      {/* Upload ảnh theo tài sản */}
      <Accordion type="single" collapsible className="mt-10">
        <AccordionItem value="upload-assets">
          <AccordionTrigger>
            <h2 className="text-lg font-semibold text-gray-800">
              Tài sản & Ảnh chuẩn bị
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            {detail?.assets?.map((asset) => (
              <div
                key={asset.allocationId}
                className="mt-4 rounded border bg-gray-50 p-4"
              >
                <p className="font-medium text-gray-600">
                  {asset.assetName} (Mã: {asset.assetId})
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={(e) =>
                    handleUpload(asset.allocationId, e.target.files!)
                  }
                  className="mt-2"
                />

                {successMap[asset.allocationId] && (
                  <p className="mt-1 text-sm font-semibold text-green-600">
                    ✅ Đã lưu thành công
                  </p>
                )}

                {asset.imageUrls?.length! > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-500">
                      Ảnh đã lưu:
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
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
                            className="h-28 w-full rounded border object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {uploadedMap[asset.allocationId]?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-600">
                      Ảnh vừa upload:
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {uploadedMap[asset.allocationId].map((url, i) => (
                        <div key={i} className="group relative">
                          <a href={url} target="_blank" rel="noreferrer">
                            <img
                              src={url}
                              alt={`Ảnh mới ${i + 1}`}
                              className="h-28 w-full rounded border object-cover"
                            />
                          </a>
                          <button
                            onClick={() =>
                              handleRemoveUploaded(asset.allocationId, url)
                            }
                            className="absolute right-1 top-1 rounded-full bg-red-600 px-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
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
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Nút lưu */}
      <div className="mt-8 flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Huỷ
        </Button>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={handleUpdate}
          disabled={uploading}
        >
          Lưu Task
        </Button>
      </div>
    </div>
  );
}
