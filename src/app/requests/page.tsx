"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";
import { SearchIcon } from "lucide-react";

const RequestProjectPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [newRequests, setNewRequests] = useState<boolean>(false); // Trạng thái thông báo mới

  const {
    data = [],
    isLoading,
    isError,
  } = useGetAssetRequestsForManagerQuery();

  // Kiểm tra khi có yêu cầu mới
  useEffect(() => {
    if (data.length > 0) {
      const pendingRequests = data.filter((r) => r.status === "PENDING_AM");
      const lastRequest = pendingRequests[pendingRequests.length - 1];
      const storedLastRequestId = localStorage.getItem("lastRequestId");

      // Kiểm tra nếu có yêu cầu mới
      if (
        !storedLastRequestId ||
        lastRequest?.requestId !== storedLastRequestId
      ) {
        setNewRequests(true);
        localStorage.setItem("lastRequestId", lastRequest?.requestId ?? "");
      } else {
        setNewRequests(false);
      }
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-xl text-gray-500">🔄 Loading requests...</div>
      </div>
    );
  if (isError)
    return (
      <div className="p-6 font-semibold text-red-500">
        ❌ Error loading data. Please try again later!
      </div>
    );

  // Filter pending requests
  const pendingRequests: AssetRequest[] = data.filter(
    (r) => r.status === "PENDING_AM",
  );

  // Group by project
  const projectMap: Record<string, { projectTitle: string; count: number }> =
    {};

  pendingRequests.forEach((r) => {
    const id = r.projectInfo?.projectID ?? "unknown";
    const title = r.projectInfo?.title ?? "Unknown Project";

    if (!projectMap[id]) {
      projectMap[id] = { projectTitle: title, count: 0 };
    }

    projectMap[id].count += 1;
  });

  const projects = Object.entries(projectMap);

  // Filter by project title
  const filteredProjects = projects.filter(([_, { projectTitle }]) =>
    projectTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Filter by status (if selected)
  const finalFilteredProjects = filteredProjects.filter(
    ([_, { projectTitle }]) => {
      if (filterStatus) {
        return projectTitle.includes(filterStatus);
      }
      return true;
    },
  );

  return (
    <div className="p-6">
      {/* Header with Search and Filter */}
      <div className="mb-6 flex flex-col border-b pb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">
          List of Projects with Asset Requests
        </h1>

        <div className="mt-4 flex items-center md:mt-0">
          {/* Search */}
          <div className="flex items-center rounded-md border border-gray-300 px-4 py-2">
            <SearchIcon className="mr-2 text-gray-500" />
            <input
              type="text"
              placeholder="Search project..."
              className="border-none bg-transparent text-gray-700 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter */}
          <select
            className="ml-4 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-300"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {newRequests && (
        <div className="mb-6 flex items-center justify-between rounded-md bg-yellow-100 p-4 text-yellow-800">
          <span>📢 New asset request(s) are waiting for approval!</span>
          <button
            onClick={() => setNewRequests(false)}
            className="rounded-md bg-yellow-500 p-2 text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {finalFilteredProjects.length === 0 ? (
        <p className="text-gray-600">
          Currently, there are no requests pending approval.
        </p>
      ) : (
        <ul className="space-y-4">
          {finalFilteredProjects.map(([projectId, { projectTitle, count }]) => (
            <li key={projectId}>
              <Link
                href={`/requests/${projectId}`}
                className="block rounded-lg border border-gray-300 p-4 transition hover:bg-gray-50"
              >
                <div className="text-lg font-semibold text-gray-800">
                  {projectTitle}
                </div>
                <div className="text-sm text-gray-600">
                  {count} requests pending approval
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RequestProjectPage;
