"use client";

import { useParams } from "next/navigation";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { CircularProgress } from "@mui/material";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useGetAssetByIdQuery } from "@/state/api/modules/assetApi";

const BorrowedAssetByDepartmentPage = () => {
  const { projectId, departmentId } = useParams<{
    projectId: string;
    departmentId: string;
  }>();

  const {
    data: borrowedAssets,
    isLoading,
    error,
  } = useGetBorrowedAssetsQuery();
  const { data: assetRequests } = useGetAssetRequestsForManagerQuery();

  if (isLoading)
    return (
      <div className="p-4 text-center">
        <CircularProgress />
      </div>
    );
  if (error)
    return <div className="p-4 text-red-500">Failed to load data.</div>;

  // Build taskID -> request map
  const requestMap: Record<string, any> = {};
  assetRequests?.forEach((request) => {
    if (request.task?.taskID) {
      requestMap[request.task.taskID] = request;
    }
  });

  // Find department name by departmentId
  const departmentName =
    Object.values(requestMap).find(
      (request) => request.requesterInfo?.department?.id === departmentId,
    )?.requesterInfo?.department?.name ?? "Unknown Department";

  // Filter borrowed assets by projectId and departmentId
  const filteredAssets = borrowedAssets?.filter((asset) => {
    const request = requestMap[asset.taskID];
    return (
      request?.projectInfo?.projectID === projectId &&
      request?.requesterInfo?.department?.id === departmentId &&
      asset.status !== "RETURNED"
    );
  });

  if (!filteredAssets || filteredAssets.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No borrowed assets found for this department.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 px-10 py-10 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/borrowAssets/${projectId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to departments
        </Link>
        <h1 className="mt-3 text-3xl font-bold text-gray-800">
          Borrowed Assets in {departmentName} Department
        </h1>
        <p className="mt-1 text-base text-gray-500">
          View all borrowed assets in this department.
        </p>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center text-gray-500">
          No borrowed assets found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {/* Header */}
            <div className="grid grid-cols-6 bg-gray-100 px-6 py-3 text-left text-sm font-semibold text-gray-700">
              <div>No</div>
              <div>Task Title</div>
              <div>Asset Name</div>
              <div>Borrowed By</div>
              <div>Borrow Time</div>
              <div>Return Time</div>
            </div>

            {/* Items */}
            {filteredAssets.map((asset, index) => {
              const request = requestMap[asset.taskID];
              const borrower = request?.requesterInfo?.fullName ?? "Unknown";
              const taskTitle = request?.task?.title ?? "Unknown Task";
              const detailUrl = `/borrowAssets/${projectId}/${departmentId}/${asset.borrowedID}`;
              const assetId = asset.assetID;
              const { data: assetDetail } = useGetAssetByIdQuery(assetId, {
                skip: !assetId,
              });

              return (
                <Link
                  key={asset.borrowedID}
                  href={detailUrl}
                  className="grid cursor-pointer grid-cols-6 items-center px-6 py-4 text-sm text-gray-700 transition hover:bg-gray-50"
                >
                  {/* STT */}
                  <div>{index + 1}</div>

                  {/* Task Title with Icon */}
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="truncate">{taskTitle}</span>
                  </div>

                  {/* Asset Name */}
                  <div className="truncate">
                    {assetDetail?.assetName || "Đang tải tên tài sản..."}
                  </div>

                  {/* Borrowed By */}
                  <div className="truncate">{borrower}</div>

                  {/* Borrow Time */}
                  <div className="truncate">
                    {format(new Date(asset.borrowTime), "dd MMM yyyy HH:mm")}
                  </div>
                  {/* Borrow Time */}
                  <div className="truncate">
                    {format(new Date(asset.endTime), "dd MMM yyyy HH:mm")}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedAssetByDepartmentPage;
