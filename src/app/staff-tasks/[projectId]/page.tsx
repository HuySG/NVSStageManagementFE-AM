"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import StaffKanban from "@/components/StaffKanban";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetPrepareProjectsByAssigneeQuery } from "@/state/api/modules/projectApi";
import { ProjectWithPrepareTasks } from "@/types/ProjectWithPrepareTasks ";
import {
  Loader2,
  Briefcase,
  CheckCircle,
  Loader,
  Circle,
  ChevronRight,
} from "lucide-react";

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "--";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  } catch {
    return "--";
  }
};

const StaffProjectDetailPage = () => {
  const { projectId } = useParams();
  const { data: user } = useGetUserInfoQuery();
  const userId = user?.id;

  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useGetPrepareProjectsByAssigneeQuery(userId!, {
    skip: !userId,
  });

  const project: ProjectWithPrepareTasks | undefined = projects.find(
    (p) => p.projectId === projectId,
  );

  // Thống kê số task từng trạng thái
  const { completed, doing, todo } = useMemo(() => {
    let completed = 0,
      doing = 0,
      todo = 0;
    for (const t of project?.prepareTasks || []) {
      if (t.status === "Completed") completed++;
      else if (t.status === "WorkInProgress") doing++;
      else todo++;
    }
    return { completed, doing, todo };
  }, [project]);

  if (!projectId)
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-lg">
        Thiếu projectId
      </div>
    );
  if (isLoading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-lg text-blue-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  if (!project)
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-lg text-red-500">
        Không tìm thấy dự án này
      </div>
    );

  const handleTaskUpdate = async () => {
    await refetch();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-0 dark:bg-neutral-900">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-8 pb-1 pt-6 text-sm text-gray-500 dark:text-gray-400">
        <Link
          href="/staff-tasks"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Dự án của tôi
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate font-semibold text-gray-700 dark:text-white">
          {project.projectTitle}
        </span>
      </div>

      {/* Project info header */}
      <div className="mb-4 flex w-full flex-col gap-4 border-b border-gray-200 bg-white px-8 py-4 dark:border-neutral-700 dark:bg-neutral-800 md:flex-row md:items-center md:justify-between">
        {/* Left: Info */}
        <div className="flex min-w-0 items-center gap-4">
          <Briefcase className="h-10 w-10 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="min-w-0">
            <div className="truncate text-2xl font-bold text-gray-800 dark:text-white">
              {project.projectTitle}
            </div>

            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300">
                <Loader className="h-4 w-4" /> Bắt đầu:{" "}
                {formatDate(project.prepareTasks?.[0]?.startDate)}
              </div>
              <div className="flex items-center gap-1 font-semibold text-red-700 dark:text-red-300">
                <Loader className="h-4 w-4" /> Kết thúc:{" "}
                {formatDate(project.prepareTasks?.[0]?.endDate)}
              </div>
            </div>
          </div>
        </div>
        {/* Right: Summary (Task statistics) */}
        <div className="flex flex-row gap-4">
          <div className="flex flex-col items-center rounded-lg border bg-green-50 px-4 py-2 dark:bg-green-950">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-lg font-semibold text-green-700">
              {completed}
            </span>
            <span className="text-xs text-gray-500">Hoàn thành</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-yellow-50 px-4 py-2 dark:bg-yellow-950">
            <Loader className="h-5 w-5 text-yellow-600" />
            <span className="text-lg font-semibold text-yellow-700">
              {doing}
            </span>
            <span className="text-xs text-gray-500">Đang làm</span>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-gray-100 px-4 py-2 dark:bg-neutral-900">
            <Circle className="h-5 w-5 text-gray-500" />
            <span className="text-lg font-semibold text-gray-700">{todo}</span>
            <span className="text-xs text-gray-500">Chưa làm</span>
          </div>
        </div>
      </div>

      {/* Kanban board */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow dark:bg-neutral-900 md:p-8">
        <StaffKanban
          key={refreshKey}
          tasks={project.prepareTasks}
          onTaskUpdate={handleTaskUpdate}
          projectId={project.projectId}
        />
      </div>
    </div>
  );
};

export default StaffProjectDetailPage;
