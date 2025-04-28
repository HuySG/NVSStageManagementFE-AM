"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";
import { FileText } from "lucide-react";
import { format } from "date-fns";

const DepartmentRequestsPage = () => {
  const { projectId, departmentId } = useParams();
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

  const requests: AssetRequest[] = allRequests.filter(
    (r) =>
      r.status === "PENDING_AM" &&
      r.projectInfo?.projectID === projectId &&
      r.requesterInfo?.department?.id === departmentId,
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 px-10 py-10 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/requests/${projectId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to departments
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-800">
          Pending Requests in Department
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Review individual requests and take action.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center text-gray-500">No requests found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {requests.map((r) => (
            <div
              key={r.requestId}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-green-50 p-3 text-green-700">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-800">
                    {r.description || "Untitled request"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Type: {r.asset ? "Specific Asset" : "Asset Category"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Requested by: {r.requesterInfo?.fullName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {format(new Date(r.approvedByDLTime), "dd MMM yyyy")}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-right">
                <Link
                  href={`/requests/${projectId}/${departmentId}/${r.requestId}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentRequestsPage;
