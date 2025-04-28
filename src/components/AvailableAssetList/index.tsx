"use client";
import { Asset } from "@/types/asset";
import React from "react";
interface AvailableAssetListProps {
  assets: Asset[];
}

const AvailableAssetList: React.FC<AvailableAssetListProps> = ({ assets }) => {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="mb-2 font-semibold text-gray-800">Available Assets:</h4>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div
            key={asset.assetID}
            className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
          >
            <div className="flex-1 text-sm text-gray-700">
              <div className="font-medium text-gray-800">{asset.assetName}</div>
              <div className="mt-1 text-xs text-gray-500">
                Code: {asset.code} | Model: {asset.model}
              </div>
              {asset.category?.name && (
                <div className="text-xs text-gray-500">
                  Category: {asset.category.name}
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
