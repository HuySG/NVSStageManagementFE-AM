"use client";

import React, { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { CircularProgress } from "@mui/material";
import BorrowedAssetDetailModal from "@/components/BorrowedAssetDetailModal";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { BorrowedAsset } from "@/types/borrowedAsset";

const BorrowedAssetManagementPage = () => {
  const {
    data: borrowedAssets,
    isLoading,
    error,
  } = useGetBorrowedAssetsQuery();
  const { data: assetRequests } = useGetAssetRequestsForManagerQuery();

  const [selectedBorrowedAsset, setSelectedBorrowedAsset] =
    useState<BorrowedAsset | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const handleRowClick = (asset: BorrowedAsset) => {
    setSelectedBorrowedAsset(asset);
    setOpenModal(true);
  };

  const satusName: Record<string, string> = {
    IN_USE: "In Use",
  };

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (error)
    return <div className="p-4 text-red-500">Failed to load data.</div>;

  // Group by project
  const groupedByProjectAndDepartment: {
    [projectId: string]: {
      title: string;
      departments: {
        [departmentId: string]: {
          name: string;
          assets: BorrowedAsset[];
        };
      };
    };
  } = {};

  borrowedAssets?.forEach((asset) => {
    const request = assetRequests?.find((r) => r.task?.taskID === asset.taskID);
    const projectId = request?.projectInfo?.projectID ?? "unknown";
    const projectTitle = request?.projectInfo?.title ?? "Unknown Project";
    const departmentId = request?.requesterInfo?.department?.id ?? "unknown";
    const departmentName =
      request?.requesterInfo?.department?.name ?? "Unknown Department";

    if (!groupedByProjectAndDepartment[projectId]) {
      groupedByProjectAndDepartment[projectId] = {
        title: projectTitle,
        departments: {},
      };
    }

    if (!groupedByProjectAndDepartment[projectId].departments[departmentId]) {
      groupedByProjectAndDepartment[projectId].departments[departmentId] = {
        name: departmentName,
        assets: [],
      };
    }

    groupedByProjectAndDepartment[projectId].departments[
      departmentId
    ].assets.push(asset);
  });

  const getBorrowerName = (taskId: string): string => {
    const request = assetRequests?.find((r) => r.task?.taskID === taskId);
    return request?.requesterInfo?.fullName ?? "Unknown";
  };

  const getTaskTitle = (taskId: string): string => {
    const request = assetRequests?.find((r) => r.task?.taskID === taskId);
    return request?.task?.title ?? taskId;
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">
        Borrowed Assets Management
      </h1>

      {Object.entries(groupedByProjectAndDepartment).map(
        ([projectId, projectData]) => (
          <div key={projectId} className="mb-10">
            <h2 className="mb-3 text-2xl font-bold text-blue-800">
              Project: {projectData.title}
            </h2>

            {Object.entries(projectData.departments).map(
              ([departmentId, departmentData]) => (
                <div key={departmentId} className="mb-6 ml-4">
                  <h3 className="mb-2 text-lg font-semibold text-green-700">
                    Department: {departmentData.name}
                  </h3>
                  <Card>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border text-sm">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="p-2">Asset ID</th>
                              <th className="p-2">Task</th>
                              <th className="p-2">Borrower</th>
                              <th className="p-2">Borrow Time</th>
                              <th className="p-2">End Time</th>
                              <th className="p-2">Status</th>
                              <th className="p-2">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {departmentData.assets.map((item) => (
                              <tr
                                key={item.borrowedId}
                                className="cursor-pointer border-t hover:bg-gray-100"
                                onClick={() => handleRowClick(item)}
                              >
                                <td className="p-2">{item.assetID}</td>
                                <td className="p-2">
                                  {getTaskTitle(item.taskID)}
                                </td>
                                <td className="p-2">
                                  {getBorrowerName(item.taskID)}
                                </td>
                                <td className="p-2">
                                  {new Date(item.borrowTime).toLocaleString()}
                                </td>
                                <td className="p-2">
                                  {new Date(item.endTime).toLocaleString()}
                                </td>
                                <td className="p-2">
                                  {satusName[item.status]}
                                </td>
                                <td className="p-2">{item.description}</td>
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
        ),
      )}

      {selectedBorrowedAsset && (
        <BorrowedAssetDetailModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          borrowedAsset={selectedBorrowedAsset}
        />
      )}
    </div>
  );
};

export default BorrowedAssetManagementPage;
