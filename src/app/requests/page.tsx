"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { AssetRequest } from "@/types/assetRequest";

const RequestProjectPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newRequests, setNewRequests] = useState(false);

  const {
    data = [],
    isLoading,
    isError,
  } = useGetAssetRequestsForManagerQuery();

  useEffect(() => {
    const pending = data.filter((r) => r.status === "PENDING_AM");
    const lastRequest = pending[pending.length - 1];
    const storedId = localStorage.getItem("lastRequestId");

    if (!storedId || lastRequest?.requestId !== storedId) {
      setNewRequests(true);
      localStorage.setItem("lastRequestId", lastRequest?.requestId ?? "");
    } else {
      setNewRequests(false);
    }
  }, [data]);

  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">Loading requests...</div>
    );
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        ❌ Failed to load requests.
      </div>
    );

  const pendingRequests: AssetRequest[] = data.filter(
    (r) => r.status === "PENDING_AM",
  );

  const grouped = pendingRequests.reduce(
    (acc, request) => {
      const id = request.projectInfo?.projectID ?? "unknown";
      const title = request.projectInfo?.title ?? "Unknown Project";
      if (!acc[id]) acc[id] = { projectTitle: title, count: 0 };
      acc[id].count += 1;
      return acc;
    },
    {} as Record<string, { projectTitle: string; count: number }>,
  );

  const filteredProjects = Object.entries(grouped).filter(
    ([_, { projectTitle }]) =>
      projectTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Asset Requests by Project
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-md border border-gray-300 px-3 py-2 shadow-sm">
            <SearchIcon className="mr-2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search project..."
              className="w-48 bg-transparent text-sm outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {newRequests && (
        <div className="mb-6 flex items-center justify-between rounded-md bg-yellow-100 p-4 text-yellow-800 shadow">
          <span>📢 New asset requests pending approval!</span>
          <button
            onClick={() => setNewRequests(false)}
            className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
          >
            Dismiss
          </button>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="text-center text-gray-500">No requests found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProjects.map(([projectId, { projectTitle, count }]) => (
            <Link
              key={projectId}
              href={`/requests/${projectId}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow transition hover:border-blue-400 hover:shadow-md"
            >
              <div className="text-xl font-semibold text-gray-800 group-hover:text-blue-700">
                {projectTitle}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {count} pending request{count > 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestProjectPage;
