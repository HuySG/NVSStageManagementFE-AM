"use client";

import React, { useState } from "react";
import { Asset } from "@/types/asset";
import {
  useAllocateAssetsMutation,
  useGetAllocatedAssetsQuery,
} from "@/state/api/modules/requestApi";
import { toast } from "react-toastify";

interface ManualAssetAllocationSectionProps {
  requestId: string;
  availableAssets: Asset[];
}

const ManualAssetAllocationSection: React.FC<
  ManualAssetAllocationSectionProps
> = ({ requestId, availableAssets }) => {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [allocateAssets, { isLoading }] = useAllocateAssetsMutation();
  const { data: allocatedAssets, refetch } =
    useGetAllocatedAssetsQuery(requestId);

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

    // ✅ Nhóm theo categoryID
    const categoryMap: Record<string, string[]> = {};

    selectedAssets.forEach((assetId) => {
      const asset = availableAssets.find((a) => a.assetID === assetId);
      const categoryId = asset?.category?.categoryID;
      if (!categoryId) return;

      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = [];
      }
      categoryMap[categoryId].push(assetId);
    });

    // ✅ Chuẩn bị dữ liệu gửi
    const allocations = Object.entries(categoryMap).map(
      ([categoryID, allocatedAssetIDs]) => ({
        categoryID,
        allocatedAssetIDs,
      }),
    );

    try {
      await allocateAssets({ requestId, allocations }).unwrap();
      toast.success("Assets allocated successfully!");
      setSelectedAssets([]);
      refetch();
    } catch (error) {
      console.error("Allocation failed:", error);
      toast.error("Failed to allocate assets.");
      console.log("Sending allocation:", {
        requestId,
        allocations,
      });
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
          {isLoading ? "Allocating..." : "Allocate Now"}
        </button>
      )}

      {/* Already allocated assets */}
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
