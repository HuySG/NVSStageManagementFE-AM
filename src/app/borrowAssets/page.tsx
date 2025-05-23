"use client";

import React from "react";
import Link from "next/link";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { groupAssetsByProjectAndDepartment } from "../lib/utils";
import { log } from "console";

const BorrowAssetsOverviewPage = () => {
  const {
    data: borrowedAssets,
    isLoading,
    error,
  } = useGetBorrowedAssetsQuery();
  const { data: assetRequests } = useGetAssetRequestsForManagerQuery();

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (error)
    return (
      <div className="p-10 text-center text-red-500">Failed to load data.</div>
    );
  const activeAssets =
    borrowedAssets?.filter((asset) => asset.status !== "RETURNED") || [];

  const groupedByProjectAndDepartment = groupAssetsByProjectAndDepartment(
    borrowedAssets,
    assetRequests,
  );
  const totalBorrowedAssets = activeAssets.length;

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Borrowed Assets Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            A summary of all borrowed assets organized by project and
            department.
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-600">
            Total borrowed assets: {totalBorrowedAssets}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groupedByProjectAndDepartment)
          .map(([projectId, projectData]) => {
            const totalAssets = Object.values(projectData.departments).reduce(
              (sum, dept) =>
                sum + dept.assets.filter((a) => a.status !== "RETURNED").length,
              0,
            );

            const activeDepartmentsCount = Object.values(
              projectData.departments,
            ).filter((dept) =>
              dept.assets.some((a) => a.status !== "RETURNED"),
            ).length;

            return {
              projectId,
              projectData,
              totalAssets,
              activeDepartmentsCount,
            };
          })
          .filter((entry) => entry.totalAssets > 0)
          .map(
            ({
              projectId,
              projectData,
              totalAssets,
              activeDepartmentsCount,
            }) => (
              <Link key={projectId} href={`/borrowAssets/${projectId}`}>
                <div className="cursor-pointer rounded-2xl border bg-white p-6 shadow-md transition-shadow hover:bg-blue-50 hover:shadow-lg">
                  <h2 className="mb-2 text-xl font-semibold text-gray-800">
                    {projectData.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeDepartmentsCount} Departments
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {totalAssets} Assets Borrowed
                  </p>
                </div>
              </Link>
            ),
          )}
      </div>
    </div>
  );
};

export default BorrowAssetsOverviewPage;
