"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useGetAssetRequestsForManagerQuery,
  useGetCheckAvailabilityResultQuery,
} from "@/state/api/modules/requestApi";
import { format } from "date-fns";
import ManualAssetAllocationSection from "@/components/ManualAssetAllocationSection";
import CheckAvailabilityDisplay from "@/components/CheckAvailability";
import { buildRequestedQuantitiesFromCheckResult } from "@/app/lib/utils";

const RequestDetailPage = () => {
  const { requestId, projectId, departmentId } = useParams();
  const { data: allRequests = [] } = useGetAssetRequestsForManagerQuery();
  const { data: result } = useGetCheckAvailabilityResultQuery(
    requestId as string,
  );
  const requestedQuantities = buildRequestedQuantitiesFromCheckResult(result!);

  const request = allRequests.find((r) => r.requestId === requestId);
  const isCategoryRequest = request && !request.asset;

  if (!request) {
    return (
      <div className="p-8 text-center text-gray-500">
        Request not found or no longer pending.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 px-10 py-10 lg:px-16">
      {/* Breadcrumb */}
      <div className="mb-6 space-x-2 text-sm text-gray-500">
        <Link href="/requests" className="text-blue-600 hover:underline">
          Projects
        </Link>
        <span>/</span>
        <Link
          href={`/requests/${projectId}`}
          className="text-blue-600 hover:underline"
        >
          Departments
        </Link>
        <span>/</span>
        <Link
          href={`/requests/${projectId}/${departmentId}`}
          className="text-blue-600 hover:underline"
        >
          Requests
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-700">Detail</span>
      </div>

      {/* Title */}
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        Request: {request.description || "Untitled"}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Created by <strong>{request.requesterInfo?.fullName}</strong> on{" "}
        {format(new Date(request.approvedByDLTime), "dd MMM yyyy")}
      </p>

      {/* Info */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Request Info
          </h2>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>
              <strong>Type:</strong>{" "}
              {isCategoryRequest ? "Asset Category" : "Specific Asset"}
            </li>
            <li>
              <strong>Status:</strong> {request.status}
            </li>
            <li>
              <strong>Department:</strong>{" "}
              {request.requesterInfo?.department?.name}
            </li>
            <li>
              <strong>Project:</strong> {request.projectInfo?.title}
            </li>
            <li>
              <strong>Description:</strong> {request.description}
            </li>
            <li>
              <strong>Start Time:</strong>{" "}
              {format(new Date(request.startTime), "dd MMM yyyy")}
            </li>
            <li>
              <strong>End Time:</strong>{" "}
              {format(new Date(request.endTime), "dd MMM yyyy")}
            </li>
            <li>
              <strong>Aprroved By:</strong> {request.approvedByDLName}
            </li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Availability Check
          </h2>
          <CheckAvailabilityDisplay requestId={requestId as string} />
        </div>
      </div>

      {/* Asset or Category List */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {isCategoryRequest ? "Requested Categories" : "Requested Asset"}
        </h2>

        {isCategoryRequest ? (
          <ul className="space-y-2 text-sm text-gray-700">
            {request.categories?.map((cat) => (
              <li key={cat.categoryID} className="rounded-md border p-3">
                {cat.name} – Quantity: {cat.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border p-4 text-sm text-gray-700">
            {request.asset?.assetName} ({request.asset?.code}) –{" "}
            {request.asset?.category?.name}
          </div>
        )}
      </div>

      {/* Manual Allocation Section */}
      {isCategoryRequest && (
        <>
          {result ? (
            result.availableAssets && result.availableAssets.length > 0 ? (
              <ManualAssetAllocationSection
                requestId={requestId as string}
                projectId={projectId as string}
                departmentId={departmentId as string}
                availableAssets={result.availableAssets}
                requestedQuantities={requestedQuantities}
              />
            ) : (
              <div className="mt-6 text-sm italic text-gray-600">
                No assets currently available for manual allocation.
              </div>
            )
          ) : (
            <div className="mt-6 text-sm text-gray-400">
              Loading allocation data...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RequestDetailPage;
