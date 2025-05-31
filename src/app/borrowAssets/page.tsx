"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Search } from "lucide-react";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { groupAssetsByProjectAndDepartment } from "../lib/utils";

const BorrowAssetsOverviewPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: borrowedAssets,
    isLoading,
    error,
  } = useGetBorrowedAssetsQuery();
  const { data: assetRequests } = useGetAssetRequestsForManagerQuery();

  // Group data
  const groupedByProjectAndDepartment = useMemo(
    () =>
      groupAssetsByProjectAndDepartment(borrowedAssets, assetRequests) || {},
    [borrowedAssets, assetRequests],
  );

  // Filter and compute stats
  const projectsList = useMemo(() => {
    return Object.entries(groupedByProjectAndDepartment)
      .map(([projectId, projectData]) => {
        const totalAssets = Object.values(projectData.departments).reduce(
          (sum, dept) =>
            sum + dept.assets.filter((a) => a.status !== "RETURNED").length,
          0,
        );
        const activeDepartments = Object.values(projectData.departments).filter(
          (dept) => dept.assets.some((a) => a.status !== "RETURNED"),
        );
        return {
          projectId,
          projectTitle: projectData.title,
          totalAssets,
          departments: activeDepartments.map((d) => d.name),
          departmentCount: activeDepartments.length,
        };
      })
      .filter((entry) => entry.totalAssets > 0)
      .filter((entry) =>
        entry.projectTitle
          ?.toLowerCase()
          .includes(searchQuery.trim().toLowerCase()),
      );
  }, [groupedByProjectAndDepartment, searchQuery]);

  // Thống kê tổng
  const totalProjects = projectsList.length;
  const totalAssets = projectsList.reduce(
    (sum, item) => sum + item.totalAssets,
    0,
  );
  // Danh sách tên phòng ban không trùng
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    projectsList.forEach((proj) => proj.departments.forEach((d) => set.add(d)));
    return { count: set.size, names: Array.from(set) };
  }, [projectsList]);

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">
        Đang tải tài sản đang mượn...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* HEADER */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <Briefcase className="h-8 w-8 text-blue-500" />
              Tài sản đang mượn theo dự án
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Danh sách các dự án hiện có tài sản đang được mượn.
            </p>
            {/* SEARCH */}
            <div className="mt-4 flex items-center gap-2">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Tên phòng ban */}
            <div className="mt-4">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tổng phòng ban đang mượn:&nbsp;
                <span className="text-lg font-bold text-green-600">
                  {uniqueDepartments.count}
                </span>
              </span>
              {uniqueDepartments.names.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {uniqueDepartments.names.map((name) => (
                    <span
                      key={name}
                      className="rounded border border-green-100 bg-green-50 px-2 py-1 text-xs font-semibold text-green-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Thống kê */}
          <div className="flex flex-col items-start gap-2 md:items-end md:gap-2">
            <span className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng dự án:&nbsp;
              <span className="text-lg font-bold text-blue-600">
                {totalProjects}
              </span>
            </span>
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng tài sản đang mượn:&nbsp;
              <span className="text-lg font-bold text-yellow-600">
                {totalAssets}
              </span>
            </span>
          </div>
        </div>
      </header>
      {/* MAIN LIST */}
      <main className="w-full px-8 py-10">
        {projectsList.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có dự án nào có tài sản đang mượn.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {projectsList.map((project) => (
              <Link
                key={project.projectId}
                href={`/borrowAssets/${project.projectId}`}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100 dark:bg-blue-900">
                  <Briefcase className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
                </div>
                <div className="mb-2 line-clamp-2 min-h-[48px] break-words text-lg font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                  {project.projectTitle}
                </div>
                <span className="mb-1 mt-1 inline-block rounded-full bg-yellow-200 px-4 py-1.5 text-sm font-semibold text-yellow-800 shadow-sm">
                  {project.departmentCount} phòng ban mượn
                </span>
                <span className="inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-800 shadow-sm">
                  {project.totalAssets} tài sản đang mượn
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BorrowAssetsOverviewPage;
