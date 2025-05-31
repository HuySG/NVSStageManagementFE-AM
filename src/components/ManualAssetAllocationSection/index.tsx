"use client";

import React, { useState } from "react";
import { Asset } from "@/types/asset";
import {
  useAllocateAssetsMutation,
  useGetAllocatedAssetsQuery,
} from "@/state/api/modules/requestApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useCreatePreparationTaskMutation } from "@/state/api/modules/taskApi";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { Box } from "lucide-react";

interface ManualAssetAllocationSectionProps {
  requestId: string;
  projectId: string;
  departmentId: string;
  availableAssets: Asset[];
  requestedQuantities: Record<string, number>;
}

const ManualAssetAllocationSection: React.FC<
  ManualAssetAllocationSectionProps
> = ({
  requestId,
  projectId,
  departmentId,
  availableAssets,
  requestedQuantities,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [allocateAssets, { isLoading }] = useAllocateAssetsMutation();
  const [createPreparationTask] = useCreatePreparationTaskMutation();
  const { data: user } = useGetUserInfoQuery();
  const { data: allocatedAssets } = useGetAllocatedAssetsQuery(requestId);
  const router = useRouter();

  const handleToggleSelect = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const handleAllocate = async () => {
    if (selectedAssets.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một tài sản.");
      return;
    }

    const selectedByCategory: Record<string, string[]> = {};
    selectedAssets.forEach((assetId) => {
      const asset = availableAssets.find((a) => a.assetID === assetId);
      const categoryId = asset?.category?.categoryID;
      if (!categoryId) return;
      if (!selectedByCategory[categoryId]) selectedByCategory[categoryId] = [];
      selectedByCategory[categoryId].push(assetId);
    });

    const sufficientAllocations = Object.entries(selectedByCategory)
      .filter(([categoryId, selected]) => {
        const required = requestedQuantities[categoryId];
        return selected.length >= required;
      })
      .map(([categoryId, allocatedAssetIDs]) => ({
        categoryID: categoryId,
        allocatedAssetIDs,
      }));

    const skippedCategories = Object.entries(selectedByCategory).filter(
      ([categoryId, selected]) => {
        const required = requestedQuantities[categoryId];
        return selected.length < required;
      },
    );

    if (sufficientAllocations.length === 0) {
      toast.error(
        "Chưa đủ số lượng tài sản cho bất kỳ loại nào. Phân bổ thất bại.",
      );
      return;
    }

    try {
      await allocateAssets({
        requestId,
        allocations: sufficientAllocations,
      }).unwrap();
      toast.success("Phân bổ tài sản thành công!");

      await createPreparationTask({
        requestId,
        createBy: user?.id ?? "",
      }).unwrap();
      toast.success("Tạo công việc chuẩn bị thành công!");

      if (skippedCategories.length > 0) {
        toast.warning(`Bỏ qua một số loại tài sản do chưa đủ số lượng.`);
      }

      router.push(`/tasks/${projectId}`);
    } catch (error) {
      console.error("Allocation or task creation failed:", error);
      toast.error("Có lỗi khi phân bổ tài sản hoặc tạo công việc chuẩn bị.");
    }
  };

  return (
    <div className="mt-10 space-y-8 rounded-2xl border border-gray-100 bg-white p-7 shadow dark:border-neutral-700 dark:bg-neutral-800">
      <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white">
        Phân bổ thủ công tài sản
      </h2>

      {/* Chọn tài sản */}
      {availableAssets.length === 0 ? (
        <p className="text-sm text-gray-500">
          Không có tài sản nào phù hợp để phân bổ.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {availableAssets.map((asset) => (
              <label
                key={asset.assetID}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:shadow dark:border-neutral-700 dark:bg-neutral-900 ${selectedAssets.includes(asset.assetID) ? "border-blue-400 ring-2 ring-blue-200 dark:ring-blue-600" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedAssets.includes(asset.assetID)}
                  onChange={() => handleToggleSelect(asset.assetID)}
                  className="form-checkbox h-5 w-5 rounded-md border-gray-300 text-blue-600 dark:bg-neutral-800"
                />
                {/* Asset icon/image */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                  <Box className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                {/* Asset info */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-gray-800 group-hover:text-blue-700 dark:text-white">
                    {asset.assetName}
                  </div>
                  <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-300">
                    <span className="font-medium">Mã:</span> {asset.code}
                    {asset.model && (
                      <>
                        {" "}
                        | <span className="font-medium">Model:</span>{" "}
                        {asset.model}
                      </>
                    )}
                  </div>
                  {asset.category?.name && (
                    <div className="truncate text-xs text-gray-500 dark:text-gray-300">
                      <span className="font-medium">Loại:</span>{" "}
                      {asset.category.name}
                    </div>
                  )}
                  {asset.location && (
                    <div className="truncate text-xs text-gray-400 dark:text-gray-400">
                      <span className="font-medium">Vị trí:</span>{" "}
                      {asset.location}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Button phân bổ */}
      {availableAssets.length > 0 && (
        <button
          onClick={handleAllocate}
          disabled={isLoading}
          className="mt-3 w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
        >
          {isLoading ? "Đang phân bổ..." : "Phân bổ & Tạo công việc chuẩn bị"}
        </button>
      )}

      {/* Tài sản đã phân bổ */}
      {allocatedAssets && allocatedAssets.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 text-base font-bold text-green-700">
            Danh sách tài sản đã phân bổ
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {allocatedAssets.map((asset) => (
              <div
                key={asset.assetID}
                className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3 dark:bg-green-900"
              >
                <Box className="h-6 w-6 text-green-700 dark:text-green-200" />
                <div className="min-w-0 flex-1 text-sm">
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {asset.assetName}
                  </span>
                  <span className="mx-1 text-gray-400">|</span>
                  <span className="text-xs text-gray-500 dark:text-gray-300">
                    {asset.code}
                  </span>
                  {asset.category?.name && (
                    <>
                      <span className="mx-1 text-gray-400">|</span>
                      <span className="text-xs text-gray-500 dark:text-gray-300">
                        {asset.category.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualAssetAllocationSection;
