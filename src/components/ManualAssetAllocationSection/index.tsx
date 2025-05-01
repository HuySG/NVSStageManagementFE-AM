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

interface ManualAssetAllocationSectionProps {
  requestId: string;
  projectId: string;
  departmentId: string;
  availableAssets: Asset[];
  requestedQuantities: Record<string, number>; // 👈 Add this prop (categoryId -> required qty)
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
  const { data: allocatedAssets, refetch } =
    useGetAllocatedAssetsQuery(requestId);
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
      toast.warning("Please select at least one asset.");
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
        "No category meets full required quantity. Allocation aborted.",
      );
      return;
    }

    try {
      await allocateAssets({
        requestId,
        allocations: sufficientAllocations,
      }).unwrap();
      toast.success("Assets allocated successfully!");

      await createPreparationTask({
        requestId,
        createBy: user?.id ?? "",
      }).unwrap();
      toast.success("Preparation task created successfully!");

      toast.success("Preparation task created successfully!");

      if (skippedCategories.length > 0) {
        const catNames = skippedCategories.map(([catId]) => catId).join(", ");
        toast.warning(
          `Skipped categories due to insufficient assets: ${catNames}`,
        );
      }

      router.push(`/tasks/${projectId}`);
    } catch (error) {
      console.error("Allocation or task creation failed:", error);
      toast.error("Failed to allocate assets or create preparation task.");
    }
  };

  return (
    <div className="mt-8 space-y-6 rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Manual Asset Allocation
      </h2>

      {availableAssets.length === 0 ? (
        <p className="text-sm text-gray-500">
          No available assets to allocate.
        </p>
      ) : (
        <div className="space-y-2">
          {availableAssets.map((asset) => (
            <label
              key={asset.assetID}
              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedAssets.includes(asset.assetID)}
                onChange={() => handleToggleSelect(asset.assetID)}
              />
              <div className="text-sm text-gray-700">
                <strong>{asset.assetName}</strong> – {asset.code} (
                {asset.category?.name})
              </div>
            </label>
          ))}
        </div>
      )}

      {availableAssets.length > 0 && (
        <button
          onClick={handleAllocate}
          disabled={isLoading}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Allocating..." : "Allocate & Create Task"}
        </button>
      )}

      {allocatedAssets && allocatedAssets.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-2 font-medium text-gray-800">Allocated Assets:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {allocatedAssets.map((asset) => (
              <li key={asset.assetID} className="rounded-md border p-2">
                {asset.assetName} – {asset.code} ({asset.category?.name})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ManualAssetAllocationSection;
