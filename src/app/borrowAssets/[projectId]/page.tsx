"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { Building2 } from "lucide-react";
import { AssetRequest } from "@/types/assetRequest";

const BorrowedAssetDepartmentsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const {
    data: borrowedAssets = [],
    isLoading,
    isError,
  } = useGetBorrowedAssetsQuery();
  const { data: assetRequests = [] } = useGetAssetRequestsForManagerQuery();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading borrowed assets...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">Failed to load data.</div>
    );
  }

  // Build taskID -> request map
  const requestMap: Record<string, AssetRequest> = {};

  assetRequests.forEach((request) => {
    if (request.task?.taskID) {
      requestMap[request.task.taskID] = request;
    }
  });

  // Filter borrowed assets by projectId
  const filteredAssets = borrowedAssets.filter((asset) => {
    const request = requestMap[asset.taskID];
    return (
      request?.projectInfo?.projectID === projectId &&
      asset.status !== "RETURNED"
    );
  });

  // Group by department
  const departmentsMap: Record<
    string,
    { departmentName: string; count: number }
  > = {};

  filteredAssets.forEach((asset) => {
    const request = requestMap[asset.taskID];
    if (!request) return;

    const deptId = request.requesterInfo?.department?.id ?? "unknown";
    const deptName =
      request.requesterInfo?.department?.name ?? "Unknown Department";

    if (!departmentsMap[deptId]) {
      departmentsMap[deptId] = { departmentName: deptName, count: 0 };
    }

    departmentsMap[deptId].count += 1;
  });

  const departments = Object.entries(departmentsMap);

  return (
    <div className="min-h-screen w-full bg-gray-50 px-10 py-10 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/borrowAssets"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to projects
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-800">
          Departments with Borrowed Assets
        </h1>
        <p className="mt-1 text-base text-gray-500">
          View borrowed assets grouped by department.
        </p>
      </div>

      {/* Departments grid layout */}
      {departments.length === 0 ? (
        <div className="text-center text-gray-500">
          No borrowed assets found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {departments.map(([deptId, { departmentName, count }]) => (
            <Link
              key={deptId}
              href={`/borrowAssets/${projectId}/${deptId}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                    {departmentName}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {count} borrowed asset{count > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowedAssetDepartmentsPage;
