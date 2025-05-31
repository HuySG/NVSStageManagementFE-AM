"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Search,
  ChevronDown,
  ListChecks,
} from "lucide-react";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetPrepareProjectsByAssigneeQuery } from "@/state/api/modules/projectApi";
import { format } from "date-fns";

// Hook kiểm soát page visibility (tab active mới polling)
const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);
  React.useEffect(() => {
    const handler = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
  return isVisible;
};

export default function StaffProjectsPage() {
  const [filter, setFilter] = useState("");
  const [sortType, setSortType] = useState<
    "start-desc" | "start-asc" | "end-asc" | "end-desc"
  >("start-desc");

  const isVisible = usePageVisibility();

  const { data: user, isLoading, error } = useGetUserInfoQuery();
  const userId = user?.id;
  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    error: projectsError,
    refetch,
  } = useGetPrepareProjectsByAssigneeQuery(userId!, {
    skip: !userId,
    pollingInterval: isVisible ? 15000 : 0, // 15s, chỉ polling khi tab active
  });

  // Tổng hợp tất cả các task của các project
  const allTasks = useMemo(
    () =>
      projects.reduce(
        (arr: any[], p: any) =>
          arr.concat(Array.isArray(p.prepareTasks) ? p.prepareTasks : []),
        [],
      ),
    [projects],
  );

  // Thống kê số lượng từng loại task cho toàn bộ hệ thống
  const { completed, doing, todo } = useMemo(() => {
    let completed = 0,
      doing = 0,
      todo = 0;
    for (const t of allTasks) {
      if (t.status === "Completed") completed++;
      else if (t.status === "WorkInProgress") doing++;
      else todo++;
    }
    return { completed, doing, todo };
  }, [allTasks]);

  // Định dạng ngày kiểu Việt Nam
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "--";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy");
    } catch {
      return "--";
    }
  };

  // Filter & Sort
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter((project) =>
      project.projectTitle.toLowerCase().includes(filter.toLowerCase()),
    );
    const getTime = (date: string | undefined) =>
      date ? new Date(date).getTime() : -Infinity;

    switch (sortType) {
      case "start-desc":
        return filtered.sort(
          (a, b) =>
            getTime(b.prepareTasks?.[0]?.startDate) -
            getTime(a.prepareTasks?.[0]?.startDate),
        );
      case "start-asc":
        return filtered.sort(
          (a, b) =>
            getTime(a.prepareTasks?.[0]?.startDate) -
            getTime(b.prepareTasks?.[0]?.startDate),
        );
      case "end-asc":
        return filtered.sort(
          (a, b) =>
            getTime(a.prepareTasks?.[0]?.endDate) -
            getTime(b.prepareTasks?.[0]?.endDate),
        );
      case "end-desc":
        return filtered.sort(
          (a, b) =>
            getTime(b.prepareTasks?.[0]?.endDate) -
            getTime(a.prepareTasks?.[0]?.endDate),
        );
      default:
        return filtered;
    }
  }, [projects, filter, sortType]);

  if (isLoading || isProjectsLoading)
    return <div className="p-10">Đang tải...</div>;
  if (error || projectsError)
    return (
      <div className="p-10 text-red-500">Không thể tải danh sách dự án</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <ListChecks className="h-8 w-8 text-blue-500" />
              Dự án được giao cho bạn
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Tổng hợp tất cả các dự án bạn đang tham gia với vai trò chuẩn bị
              asset.
            </p>
          </div>
          {/* Thống kê tổng task */}
          <div className="flex flex-col items-start gap-2 md:items-end md:gap-2">
            <span className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng số task:{" "}
              <span className="text-lg font-bold text-blue-600">
                {allTasks.length}
              </span>
            </span>
            <div className="mt-1 flex gap-2">
              <span className="rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                Hoàn thành: {completed}
              </span>
              <span className="rounded bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                Đang làm: {doing}
              </span>
              <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                Chưa làm: {todo}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & SORT */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên dự án..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100"
            />
          </div>
          <div className="relative">
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as any)}
              className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100"
            >
              <option value="start-desc">Mới nhất (bắt đầu)</option>
              <option value="start-asc">Cũ nhất (bắt đầu)</option>
              <option value="end-asc">Kết thúc gần nhất</option>
              <option value="end-desc">Kết thúc xa nhất</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </header>

      {/* Danh sách dự án */}
      <main className="w-full px-8 py-8">
        {filteredProjects.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            Không có dự án phù hợp.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProjects.map((project) => {
              // Lấy ngày bắt đầu/kết thúc đầu tiên trong danh sách task, nếu có
              const firstTask = project.prepareTasks?.[0] || {};
              const { completed, doing, todo } = (() => {
                let completed = 0,
                  doing = 0,
                  todo = 0;
                for (const t of project.prepareTasks || []) {
                  if (t.status === "Completed") completed++;
                  else if (t.status === "WorkInProgress") doing++;
                  else todo++;
                }
                return { completed, doing, todo };
              })();

              return (
                <Link
                  href={`/staff-tasks/${project.projectId}`}
                  key={project.projectId}
                  className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow transition hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div className="mb-4">
                    <Briefcase className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600 dark:text-white">
                    {project.projectTitle}
                  </div>

                  <div className="mt-4 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        Bắt đầu:&nbsp;
                      </span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        {formatDate(firstTask.startDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <span className="font-semibold text-red-700 dark:text-red-300">
                        Kết thúc:&nbsp;
                      </span>
                      <span className="font-semibold text-red-700 dark:text-red-300">
                        {formatDate(firstTask.endDate)}
                      </span>
                    </div>
                  </div>
                  {/* Thống kê task trong từng project */}
                  <div className="mt-4 flex gap-2">
                    <span className="rounded bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                      Hoàn thành: {completed}
                    </span>
                    <span className="rounded bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                      Đang làm: {doing}
                    </span>
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                      Chưa làm: {todo}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
