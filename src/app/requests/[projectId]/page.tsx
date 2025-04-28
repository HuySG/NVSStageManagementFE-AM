"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";
import { Building2 } from "lucide-react";

const ProjectDepartmentsPage = () => {
  const { projectId } = useParams();
  const {
    data: allRequests = [],
    isLoading,
    isError,
  } = useGetAssetRequestsForManagerQuery();

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Loading requests...</div>
    );

  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Failed to load data.</div>
    );

  // Filter requests by project and status
  const requests: AssetRequest[] = allRequests.filter(
    (r) => r.status === "PENDING_AM" && r.projectInfo?.projectID === projectId,
  );

  const departmentsMap: Record<
    string,
    { departmentName: string; count: number }
  > = {};

  requests.forEach((r) => {
    const deptId = r.requesterInfo?.department?.id ?? "unknown";
    const deptName = r.requesterInfo?.department?.name ?? "Unknown Department";

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
          href="/requests"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to projects
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-800">
          Departments with Asset Requests
        </h1>
        <p className="mt-1 text-base text-gray-500">
          View and manage pending requests by department.
        </p>
      </div>

      {/* Departments grid layout */}
      {departments.length === 0 ? (
        <div className="text-center text-gray-500">
          No pending requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {departments.map(([deptId, { departmentName, count }]) => (
            <Link
              key={deptId}
              href={`/requests/${projectId}/${deptId}`}
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
                    {count} pending request{count > 1 ? "s" : ""}
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

export default ProjectDepartmentsPage;
