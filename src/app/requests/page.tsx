"use client";

import React, { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/app/redux";
import { Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import {
  useAcceptAssetRequestMutation,
  useAcceptBookingRequestMutation,
  useGetAssetRequestsForManagerQuery,
  useUpdateAssetStatusMutation,
} from "@/state/api/modules/requestApi";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { AssetRequest } from "@/types/assetRequest";

const statusMapping: Record<string, string> = {
  PENDING_LEADER: "Pending Leader Approval",
  LEADER_APPROVED: "Leader Approved, Pending AM",
  LEADER_REJECTED: "Leader Rejected",
  PENDING_AM: "Pending Asset Manager Approval",
  AM_APPROVED: "Asset Manager Approved",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

const RequestAMPage = () => {
  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useGetAssetRequestsForManagerQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  const [acceptBookingRequest] = useAcceptBookingRequestMutation();
  const [updateRequestStatus] = useUpdateAssetStatusMutation();
  const { data: user } = useGetUserInfoQuery();
  const [acceptAssetRequest] = useAcceptAssetRequestMutation();
  const { data: borrowedAssets } = useGetBorrowedAssetsQuery();

  const isAssetAvailable = (assetId: string) => {
    if (!borrowedAssets) return true;
    return !borrowedAssets.some(
      (b) =>
        b.assetID === assetId && b.status?.toUpperCase().trim() === "IN_USE",
    );
  };

  const handleApprove = async (request: AssetRequest) => {
    try {
      setLoadingRequestId(request.requestId);

      if (request.asset) {
        // Booking-based
        await acceptBookingRequest({
          requestId: request.requestId,
          userId: user?.id ?? "",
        }).unwrap();
      } else {
        // Category-based
        await acceptAssetRequest(request.requestId).unwrap();
      }

      toast.success("Approved successfully!");
    } catch (error) {
      toast.error("Approval failed!");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setLoadingRequestId(requestId);
      await updateRequestStatus({
        requestId,
        status: "REJECTED",
        approverId: user?.id!,
      }).unwrap();
      toast.success("Request rejected successfully");
      await refetch();
    } catch (err) {
      console.error("Rejection failed", err);
      toast.error("Failed to reject request");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const requests = data.filter(
    (request: AssetRequest) => request.status === "PENDING_AM",
  );

  const groupedByProjectAndDepartment: Record<
    string,
    {
      projectTitle: string;
      departments: Record<
        string,
        {
          departmentName: string;
          requests: AssetRequest[];
        }
      >;
    }
  > = {};

  requests.forEach((request) => {
    const projectId = request.projectInfo?.projectID ?? "unknown_project";
    const projectTitle = request.projectInfo?.title ?? "Unknown Project";
    const departmentId =
      request.requesterInfo?.department?.id ?? "unknown_department";
    const departmentName =
      request.requesterInfo?.department?.name ?? "Unknown Department";

    if (!groupedByProjectAndDepartment[projectId]) {
      groupedByProjectAndDepartment[projectId] = {
        projectTitle,
        departments: {},
      };
    }

    if (!groupedByProjectAndDepartment[projectId].departments[departmentId]) {
      groupedByProjectAndDepartment[projectId].departments[departmentId] = {
        departmentName,
        requests: [],
      };
    }

    groupedByProjectAndDepartment[projectId].departments[
      departmentId
    ].requests.push(request);
  });

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (error)
    return (
      <div className="p-4 text-center text-red-500">
        Error loading requests.
      </div>
    );

  return (
    <div
      className={`p-6 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}
    >
      <h1 className="mb-6 text-center text-3xl font-bold">
        Asset Manager Approval
      </h1>

      {Object.entries(groupedByProjectAndDepartment).map(
        ([projectId, { projectTitle, departments }]) => (
          <div key={projectId} className="mb-10">
            <h2 className="mb-4 text-2xl font-bold">Project: {projectTitle}</h2>

            {Object.entries(departments).map(
              ([departmentId, { departmentName, requests }]) => {
                const assetBased = requests.filter((r) => r.asset !== null);
                const categoryBased = requests.filter((r) => r.asset === null);

                return (
                  <div
                    key={departmentId}
                    className="mb-6 border-l-4 border-blue-400 pl-4"
                  >
                    <h3 className="mb-2 text-xl font-semibold text-blue-700">
                      Department: {departmentName}
                    </h3>

                    {/* Asset-Based Requests */}
                    {assetBased.length > 0 && (
                      <Card className="mb-6">
                        <CardContent>
                          <h3 className="mb-4 text-xl font-bold">
                            Asset-Based Requests
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border text-sm">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="p-2">Description</th>
                                  <th className="p-2">Status</th>
                                  <th className="p-2">Asset</th>
                                  <th className="p-2">Task</th>
                                  <th className="p-2">Time</th>
                                  <th className="p-2">Requester</th>
                                  <th className="p-2">Leader Approved</th>
                                  <th className="p-2">Leader Time</th>
                                  <th className="p-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {assetBased.map((r) => (
                                  <tr key={r.requestId} className="border-t">
                                    <td className="p-2">{r.description}</td>
                                    <td className="p-2">
                                      {statusMapping[r.status]}
                                    </td>
                                    <td className="p-2">
                                      {r.asset?.assetName}
                                    </td>
                                    <td className="p-2">{r.task?.title}</td>
                                    <td className="p-2">
                                      <div>
                                        <strong>Start:</strong>{" "}
                                        {new Date(r.startTime).toLocaleString(
                                          "vi-VN",
                                          {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                            second: "numeric",
                                            hour12: false, // Nếu muốn hiển thị 24 giờ
                                          },
                                        )}
                                      </div>
                                      <div>
                                        <strong>End:</strong>{" "}
                                        {new Date(r.endTime).toLocaleString(
                                          "vi-VN",
                                          {
                                            weekday: "short",
                                            year: "numeric",
                                            month: "numeric",
                                            day: "numeric",
                                            hour: "numeric",
                                            minute: "numeric",
                                            second: "numeric",
                                            hour12: false, // Nếu muốn hiển thị 24 giờ
                                          },
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      {r.requesterInfo?.fullName}
                                    </td>
                                    <td className="p-2">
                                      {r.approvedByDLName}
                                    </td>
                                    <td className="p-2">
                                      {new Date(
                                        r.approvedByDLTime,
                                      ).toLocaleString("vi-VN", {
                                        weekday: "short",
                                        year: "numeric",
                                        month: "numeric",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "numeric",
                                        second: "numeric",
                                        hour12: false, // Nếu muốn định dạng 24 giờ
                                      })}
                                    </td>

                                    <td className="space-x-2 p-2">
                                      <div className="flex flex-col items-start gap-1">
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          color="success"
                                          onClick={() => handleApprove(r)}
                                          disabled={
                                            !r.asset ||
                                            !isAssetAvailable(r.asset.assetID)
                                          }
                                        >
                                          {loadingRequestId === r.requestId ? (
                                            <CircularProgress size={16} />
                                          ) : (
                                            "Approve"
                                          )}
                                        </Button>
                                        {!r.asset ||
                                          (!isAssetAvailable(
                                            r.asset.assetID,
                                          ) && (
                                            <span className="text-xs text-red-500">
                                              Asset is currently borrowed
                                            </span>
                                          ))}
                                      </div>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleReject(r.requestId)
                                        }
                                      >
                                        Reject
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Category-Based Requests */}
                    {categoryBased.length > 0 && (
                      <Card>
                        <CardContent>
                          <h3 className="mb-4 text-xl font-bold">
                            Category-Based Requests
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="w-full border text-sm">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="p-2">Description</th>
                                  <th className="p-2">Status</th>
                                  <th className="p-2">Asset</th>
                                  <th className="p-2">Task</th>
                                  <th className="p-2">Time</th>
                                  <th className="p-2">Requester</th>
                                  <th className="p-2">Leader Approved</th>
                                  <th className="p-2">Leader Time</th>
                                  <th className="p-2">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {categoryBased.map((r) => (
                                  <tr key={r.requestId} className="border-t">
                                    <td className="p-2">{r.description}</td>

                                    <td className="p-2">
                                      <ul className="list-disc pl-5 text-sm text-gray-600">
                                        {r.categories?.map((cat) => (
                                          <li key={cat.categoryID}>
                                            {cat.name} (x{cat.quantity})
                                          </li>
                                        ))}
                                      </ul>
                                    </td>

                                    <td className="p-2">
                                      {statusMapping[r.status]}
                                    </td>
                                    <td className="p-2">
                                      <div>
                                        <strong>Start:</strong>{" "}
                                        {new Date(
                                          r.startTime,
                                        ).toLocaleDateString()}
                                      </div>
                                      <div>
                                        <strong>End:</strong>{" "}
                                        {new Date(
                                          r.endTime,
                                        ).toLocaleDateString()}
                                      </div>
                                    </td>
                                    <td className="p-2">{r.task?.title}</td>
                                    <td className="p-2">
                                      {r.requesterInfo?.fullName}
                                    </td>
                                    <td className="space-x-2 p-2">
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        color="success"
                                        onClick={() => handleApprove(r)}
                                      >
                                        {loadingRequestId === r.requestId ? (
                                          <CircularProgress size={16} />
                                        ) : (
                                          "Approve"
                                        )}
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={() =>
                                          handleReject(r.requestId)
                                        }
                                      >
                                        Reject
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                );
              },
            )}
          </div>
        ),
      )}
    </div>
  );
};

export default RequestAMPage;
