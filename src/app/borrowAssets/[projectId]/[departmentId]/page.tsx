"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { useGetAssetsQuery } from "@/state/api/modules/assetApi";
import { CircularProgress } from "@mui/material";
import { format } from "date-fns";
import { FileText, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import Link from "next/link";

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
  const { data: assets = [] } = useGetAssetsQuery();

  // Build taskID -> request map
  const requestMap: Record<string, any> = useMemo(() => {
    const map: Record<string, any> = {};
    assetRequests?.forEach((request) => {
      if (request.task?.taskID) {
        map[request.task.taskID] = request;
      }
    });
    return map;
  }, [assetRequests]);

  // Find department name & project name
  const departmentName =
    Object.values(requestMap).find(
      (request) => request.requesterInfo?.department?.id === departmentId,
    )?.requesterInfo?.department?.name ?? "Phòng ban chưa xác định";
  const projectName =
    assetRequests?.find((r) => r.projectInfo?.projectID === projectId)
      ?.projectInfo?.title ?? "Dự án";

  // Filter borrowed assets by projectId and departmentId
  const filteredAssetsRaw = useMemo(
    () =>
      borrowedAssets?.filter((asset) => {
        const request = requestMap[asset.taskID];
        return (
          request?.projectInfo?.projectID === projectId &&
          request?.requesterInfo?.department?.id === departmentId &&
          asset.status !== "RETURNED"
        );
      }) ?? [],
    [borrowedAssets, requestMap, projectId, departmentId],
  );

  // Chuẩn hóa dữ liệu filter
  const enrichedAssets = useMemo(
    () =>
      filteredAssetsRaw.map((asset) => {
        const request = requestMap[asset.taskID];
        const assetDetail = assets.find((a) => a.assetID === asset.assetID);
        // Đảm bảo borrower không null, trim, fallback về "Không xác định"
        let borrower =
          request?.requesterInfo?.fullName?.trim() || "Không xác định";
        return {
          ...asset,
          borrower,
          taskTitle: request?.task?.title ?? "Không xác định",
          assetName: assetDetail?.assetName ?? "Đang tải...",
          assetCategory: assetDetail?.category?.name ?? "--",
          assetType: assetDetail?.assetType?.name ?? "--",
        };
      }),
    [filteredAssetsRaw, assets, requestMap],
  );

  // Tập hợp các giá trị duy nhất cho từng filter, không lấy giá trị "--" hoặc null
  const uniqueBorrowers = useMemo(
    () =>
      Array.from(new Set(enrichedAssets.map((a) => a.borrower.trim()))).filter(
        (name) => name && name !== "Không xác định",
      ),
    [enrichedAssets],
  );
  const uniqueCategories = useMemo(
    () =>
      Array.from(
        new Set(enrichedAssets.map((a) => a.assetCategory.trim())),
      ).filter((v) => v && v !== "--"),
    [enrichedAssets],
  );
  const uniqueTypes = useMemo(
    () =>
      Array.from(new Set(enrichedAssets.map((a) => a.assetType.trim()))).filter(
        (v) => v && v !== "--",
      ),
    [enrichedAssets],
  );

  // State filter
  const [borrowerFilter, setBorrowerFilter] = useState("Tất cả");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [typeFilter, setTypeFilter] = useState("Tất cả");

  // Áp dụng filter (luôn trim khi so sánh)
  const filteredAssets = useMemo(
    () =>
      enrichedAssets.filter(
        (a) =>
          (borrowerFilter === "Tất cả" ||
            a.borrower.trim() === borrowerFilter) &&
          (categoryFilter === "Tất cả" ||
            a.assetCategory.trim() === categoryFilter) &&
          (typeFilter === "Tất cả" || a.assetType.trim() === typeFilter),
      ),
    [enrichedAssets, borrowerFilter, categoryFilter, typeFilter],
  );

  const totalAssets = filteredAssets.length;

  if (isLoading)
    return (
      <div className="flex items-center justify-center p-10 text-gray-400">
        <CircularProgress />
        <span className="ml-4">Đang tải dữ liệu...</span>
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu.
      </div>
    );

  if (!enrichedAssets || enrichedAssets.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        Không có tài sản đang mượn của phòng ban này.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-neutral-900">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-2 pb-3 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/borrowAssets"
          className="flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Dự án mượn tài sản
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/borrowAssets/${projectId}`}
          className="font-semibold text-blue-700 hover:underline dark:text-blue-300"
        >
          {projectName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-gray-700 dark:text-white">
          {departmentName}
        </span>
      </div>

      {/* HEADER */}
      <header className="mb-10 w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <Building2 className="h-8 w-8 text-blue-500" />
              Danh sách tài sản đang mượn
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Phòng ban{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {departmentName}
              </span>{" "}
              thuộc dự án{" "}
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {projectName}
              </span>{" "}
              đang mượn các tài sản sau.
            </p>
          </div>
          <div className="mt-2 md:mt-0">
            <span className="inline-block rounded-full bg-yellow-100 px-6 py-3 text-base font-semibold text-yellow-800 shadow-sm">
              Tổng: {totalAssets} tài sản
            </span>
          </div>
        </div>
      </header>

      {/* Bộ lọc */}
      <div className="mb-8 flex flex-wrap items-center gap-4 px-2">
        {/* Filter by nhân viên */}
        <div>
          <label className="mr-2 font-semibold text-gray-700 dark:text-gray-200">
            Nhân viên:
          </label>
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            value={borrowerFilter}
            onChange={(e) => setBorrowerFilter(e.target.value)}
            disabled={uniqueBorrowers.length === 0}
          >
            <option value="Tất cả">Tất cả</option>
            {uniqueBorrowers.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {/* Filter by loại */}
        <div>
          <label className="mr-2 font-semibold text-gray-700 dark:text-gray-200">
            Loại tài sản:
          </label>
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={uniqueCategories.length === 0}
          >
            <option value="Tất cả">Tất cả</option>
            {uniqueCategories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {/* Filter by kiểu */}
        <div>
          <label className="mr-2 font-semibold text-gray-700 dark:text-gray-200">
            Kiểu tài sản:
          </label>
          <select
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            disabled={uniqueTypes.length === 0}
          >
            <option value="Tất cả">Tất cả</option>
            {uniqueTypes.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {/* Table Header */}
          <div className="grid grid-cols-8 bg-gray-100 px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:bg-neutral-800 dark:text-white">
            <div>STT</div>
            <div>Tên công việc</div>
            <div>Tên tài sản</div>
            <div>Loại tài sản</div>
            <div>Kiểu tài sản</div>
            <div>Người mượn</div>
            <div>Thời gian mượn</div>
            <div>Thời gian trả</div>
          </div>

          {/* Table Rows */}
          {filteredAssets.map((asset, index) => {
            const detailUrl = `/borrowAssets/${projectId}/${departmentId}/${asset.borrowedID}`;
            return (
              <Link
                key={asset.borrowedID}
                href={detailUrl}
                className="grid cursor-pointer grid-cols-8 items-center px-6 py-4 text-sm text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-neutral-800"
              >
                <div>{index + 1}</div>
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{asset.taskTitle}</span>
                </div>
                <div className="truncate">{asset.assetName}</div>
                <div className="truncate">{asset.assetCategory}</div>
                <div className="truncate">{asset.assetType}</div>
                <div className="truncate">{asset.borrower}</div>
                <div className="truncate">
                  {format(new Date(asset.borrowTime), "dd/MM/yyyy HH:mm")}
                </div>
                <div className="truncate">
                  {format(new Date(asset.endTime), "dd/MM/yyyy HH:mm")}
                </div>
              </Link>
            );
          })}
          {filteredAssets.length === 0 && (
            <div className="col-span-8 px-6 py-8 text-center text-gray-400">
              Không tìm thấy tài sản nào với điều kiện lọc hiện tại.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowedAssetByDepartmentPage;
