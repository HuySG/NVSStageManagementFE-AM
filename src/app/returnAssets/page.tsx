"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetReturnAssetsQuery } from "@/state/api/modules/returnAssetApi";

const ReturnAssetsPage: React.FC = () => {
  const { data: assets = [], isLoading, error } = useGetReturnAssetsQuery();

  // Log dữ liệu trả về từ API
  console.log("Returned assets:", assets);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-lg font-semibold">Loading...</div>
    );
  }

  if (error) {
    console.error("Error fetching return assets:", error);
    return (
      <div className="p-4 text-center text-lg font-semibold text-red-500">
        Error loading return assets.
      </div>
    );
  }

  const groupedByProject: Record<
    string,
    {
      projectTitle: string;
      assets: typeof assets;
    }
  > = {};

  assets.forEach((asset) => {
    const projectId = asset.projectID ?? "unknown_project";
    const projectTitle = asset.title ?? "Unknown Project";

    if (!groupedByProject[projectId]) {
      groupedByProject[projectId] = {
        projectTitle,
        assets: [],
      };
    }

    groupedByProject[projectId].assets.push(asset);
  });

  return (
    <div className="bg-gray-50 p-6 text-gray-800">
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
        Return Assets
      </h1>

      {Object.entries(groupedByProject).map(
        ([projectId, { projectTitle, assets }]) => (
          <div key={projectId} className="mb-10">
            <h2 className="mb-4 text-2xl font-semibold text-gray-700">
              Project: {projectTitle}
            </h2>

            <Card className="shadow-md">
              <CardContent>
                <h3 className="mb-4 text-xl font-semibold text-gray-600">
                  Returned Assets
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300 text-left text-sm">
                    <thead>
                      <tr className="bg-gray-200 text-gray-700">
                        <th className="border-b border-gray-300 p-3">
                          Returned Asset ID
                        </th>
                        <th className="border-b border-gray-300 p-3">
                          Asset ID
                        </th>
                        <th className="border-b border-gray-300 p-3">
                          Description
                        </th>
                        <th className="border-b border-gray-300 p-3">
                          Return Time
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {assets.map((asset, index) => (
                        <tr
                          key={asset.returnedAssetID}
                          className={
                            index % 2 === 0 ? "bg-gray-100" : "bg-white"
                          }
                        >
                          <td className="border-b border-gray-300 p-3">
                            {asset.returnedAssetID}
                          </td>
                          <td className="border-b border-gray-300 p-3">
                            {asset.assetID || "N/A"}
                          </td>
                          <td className="border-b border-gray-300 p-3">
                            {asset.description || "N/A"}
                          </td>
                          <td className="border-b border-gray-300 p-3">
                            {asset.returnTime
                              ? new Date(asset.returnTime).toLocaleString(
                                  "vi-VN",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "numeric",
                                    second: "numeric",
                                    hour12: false,
                                  },
                                )
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ),
      )}
    </div>
  );
};

export default ReturnAssetsPage;
