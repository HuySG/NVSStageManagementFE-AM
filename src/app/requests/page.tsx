"use client";

import React, { useState } from "react";
import {
  AssetRequest,
  useAcceptAssetRequestMutation,
  useAcceptBookingRequestMutation,
  useAcceptRequestMutation,
  useGetAssetRequestsForManagerQuery,
  useGetUserInfoQuery,
  useUpdateAssetStatusMutation,
} from "@/state/api";
import { Card, CardContent } from "@/components/ui/card";
import { useAppSelector } from "@/app/redux";
import { Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

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

  const handleApprove = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      await acceptBookingRequest({
        requestId,
        userId: user?.id ?? "",
      }).unwrap();

      toast.success("Request approved successfully!");
    } catch (error: any) {
      toast.error(
        error?.data || "Failed to approve request. Please try again.",
      );
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

  const groupedByProject: Record<string, AssetRequest[]> = {};
  requests.forEach((request) => {
    const projectId = request.projectInfo?.projectID;
    if (!groupedByProject[projectId]) groupedByProject[projectId] = [];
    groupedByProject[projectId].push(request);
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

      {Object.entries(groupedByProject).map(([projectId, requests]) => {
        const projectTitle =
          requests[0]?.projectInfo?.title ?? "Unknown Project";

        const assetBased = requests.filter((r) => r.asset !== null);
        const categoryBased = requests.filter((r) => r.asset === null);

        return (
          <div key={projectId} className="mb-10">
            <h2 className="mb-2 text-2xl font-semibold">
              Project: {projectTitle}
            </h2>

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
                          <th className="p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assetBased.map((r) => (
                          <tr key={r.requestId} className="border-t">
                            <td className="p-2">{r.description}</td>
                            <td className="p-2">{statusMapping[r.status]}</td>
                            <td className="p-2">{r.asset?.assetName}</td>
                            <td className="p-2">{r.task?.title}</td>
                            <td className="p-2">
                              <div>
                                <strong>Start:</strong>{" "}
                                {new Date(r.startTime).toLocaleDateString()}
                              </div>
                              <div>
                                <strong>End:</strong>{" "}
                                {new Date(r.endTime).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-2">{r.requesterInfo?.fullName}</td>
                            <td className="space-x-2 p-2">
                              <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                onClick={() => handleApprove(r.requestId)}
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
                                onClick={() => handleReject(r.requestId)}
                              >
                                Reject
                              </Button>{" "}
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
                          <th className="p-2">Time</th>
                          <th className="p-2">Task</th>
                          <th className="p-2">Requester</th>
                          <th className="p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryBased.map((r) => (
                          <tr key={r.requestId} className="border-t">
                            <td className="p-2">{r.description}</td>
                            <td className="p-2">{statusMapping[r.status]}</td>
                            <td className="p-2">
                              <div>
                                <strong>Start:</strong>{" "}
                                {new Date(r.startTime).toLocaleDateString()}
                              </div>
                              <div>
                                <strong>End:</strong>{" "}
                                {new Date(r.endTime).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="p-2">{r.task?.title}</td>
                            <td className="p-2">{r.requesterInfo?.fullName}</td>
                            <td className="space-x-2 p-2">
                              <Button
                                variant="outlined"
                                size="small"
                                color="success"
                                onClick={() => handleApprove(r.requestId)}
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
                                onClick={() => handleReject(r.requestId)}
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
      })}
    </div>
  );
};

export default RequestAMPage;
