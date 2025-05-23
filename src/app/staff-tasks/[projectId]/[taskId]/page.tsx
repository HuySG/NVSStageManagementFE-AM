"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { uploadToFirebase } from "@/lib/firebase";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetPreparationDetailsQuery } from "@/state/api/modules/taskApi";
import {
  useUpdateAssetStatusMutation,
  useUploadBeforeImagesMutation,
} from "@/state/api/modules/requestApi";
import { toast } from "react-toastify";

const PrepareAssetDetailPage = () => {
  const { projectId, taskId } = useParams();
  const router = useRouter();
  const { data: user } = useGetUserInfoQuery();

  const {
    data: detail,
    isLoading,
    refetch: refetchDetail,
  } = useGetPreparationDetailsQuery(taskId as string, {
    skip: !taskId,
  });

  const [uploadedMap, setUploadedMap] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState(false);
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});

  const [uploadBeforeImages] = useUploadBeforeImagesMutation();
  const [updateStatus] = useUpdateAssetStatusMutation();

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

  const handleComplete = async () => {
    const requestId = detail?.request?.[0]?.requestId;
    if (!user?.id || !requestId) return;
    await updateStatus({ requestId, status: "PREPARED", approverId: user.id });
    toast.success("Đã hoàn tất chuẩn bị!");
    router.push(`/staff-tasks/${projectId}`);
  };

  const allUploaded =
    detail?.assets?.length! > 0 &&
    detail!.assets.every((a) => uploadedMap[a.allocationId]?.length > 0);

  return (
    <div className="min-h-screen bg-white px-8 py-10">
      <Link
        href={`/staff-tasks/${projectId}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Quay lại danh sách task
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-gray-800">
        Chi tiết Task Chuẩn bị Tài sản
      </h1>

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

      <Accordion type="single" collapsible className="mt-10">
        <AccordionItem value="upload-assets">
          <AccordionTrigger>
            <h2 className="text-lg font-semibold text-gray-800">
              Tài sản & Ảnh chuẩn bị
            </h2>
          </AccordionTrigger>
          <AccordionContent>
            {isLoading ? (
              <p className="text-sm text-gray-500">Đang tải tài sản...</p>
            ) : (
              detail?.assets?.map((asset) => (
                <div
                  key={asset.allocationId}
                  className="mt-4 rounded border bg-gray-50 p-4"
                >
                  <p className="font-medium text-gray-600">
                    {asset.assetName} (Mã: {asset.assetId})
                  </p>
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleUpload(asset.allocationId, e.target.files!)
                    }
                  />

                  {successMap[asset.allocationId] && (
                    <p className="mt-1 text-sm font-semibold text-green-600">
                      Đã lưu thành công
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
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
              ))
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <button
        className="mt-8 rounded bg-blue-600 px-6 py-2 text-white disabled:opacity-50"
        disabled={!allUploaded || uploading}
        onClick={handleComplete}
      >
        Hoàn tất chuẩn bị
      </button>
    </div>
  );
};

export default PrepareAssetDetailPage;
