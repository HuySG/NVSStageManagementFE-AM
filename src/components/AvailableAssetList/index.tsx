"use client";
import { Asset } from "@/types/asset";
import React from "react";
import { Box } from "lucide-react";

interface AvailableAssetListProps {
  assets: Asset[];
}

const AvailableAssetList: React.FC<AvailableAssetListProps> = ({ assets }) => {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.assetID}
            className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow transition hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-800"
          >
            {/* Asset image or icon */}
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 dark:bg-blue-900">
              {asset.image ? (
                <img
                  src={asset.image}
                  alt={asset.assetName}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <Box className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
              )}
            </div>
            {/* Info */}
            <div className="flex-1 text-sm">
              <div className="line-clamp-1 font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                {asset.assetName}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                <span className="font-medium">Mã:</span> {asset.code}
                {asset.model && (
                  <>
                    {" "}
                    | <span className="font-medium">Model:</span> {asset.model}
                  </>
                )}
              </div>
              {asset.category?.name && (
                <div className="text-xs text-gray-500 dark:text-gray-300">
                  <span className="font-medium">Loại:</span>{" "}
                  {asset.category.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableAssetList;
