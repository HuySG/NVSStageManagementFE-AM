"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import KanbanBoard from "@/components/KanbanBoard";
import { useGetProjectDetailsByIdQuery } from "@/state/api/modules/projectApi";
import { useGetPrepareTasksByProjectIdQuery } from "@/state/api/modules/taskApi";
import {
  useGetUserInfoQuery,
  useGetUserByDepartmentQuery,
} from "@/state/api/modules/userApi";
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

export default function LeaderAMProjectDetailPage() {
  const { projectId } = useParams();
  const [refreshKey, setRefreshKey] = useState(0);
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");

  // Lấy thông tin user (để lấy departmentId)
  const { data: user } = useGetUserInfoQuery();
  const departmentId = user?.department?.id ?? "";

  // Lấy danh sách user của phòng ban
  const { data: users = [] } = useGetUserByDepartmentQuery(departmentId, {
    skip: !departmentId,
  });

  // Lấy thông tin project
  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
  } = useGetProjectDetailsByIdQuery(projectId as string, { skip: !projectId });

  // Lấy danh sách task của project
  const {
    data: tasks = [],
    isLoading: isTasksLoading,
    error: tasksError,
    refetch,
  } = useGetPrepareTasksByProjectIdQuery(projectId as string, {
    skip: !projectId,
  });

  // Map staffID -> name (type safe)
  const userMap = useMemo(() => {
    const map: Record<string, string> = {};
    users.forEach((u) => {
      if (typeof u.id === "string" && typeof u.fullName === "string") {
        map[u.id] = u.fullName;
      }
    });
    return map;
  }, [users]);

  // Filtered tasks theo nhân viên
  const filteredTasks = useMemo(() => {
    if (!assigneeFilter) return tasks;
    return tasks.filter((t) => t.assigneeID === assigneeFilter);
  }, [tasks, assigneeFilter]);

  // Tổng quan theo staff
  const staffStats = useMemo(() => {
    const stats: Record<
      string,
      {
        name: string;
        total: number;
        completed: number;
        doing: number;
        todo: number;
      }
    > = {};
    users.forEach((user) => {
      if (user.id) {
        stats[user.id] = {
          name: user.fullName || "Không xác định",
          total: 0,
          completed: 0,
          doing: 0,
          todo: 0,
        };
      }
    });
    tasks.forEach((t) => {
      if (t.assigneeID && stats[t.assigneeID]) {
        stats[t.assigneeID].total += 1;
        if (t.status === "Completed") stats[t.assigneeID].completed += 1;
        else if (t.status === "WorkInProgress") stats[t.assigneeID].doing += 1;
        else stats[t.assigneeID].todo += 1;
      }
    });
    return Object.values(stats);
  }, [tasks, users]);

  // Thống kê số task từng trạng thái cho project (tổng hợp)
  const { completed, doing, todo } = useMemo(() => {
    let completed = 0,
      doing = 0,
      todo = 0;
    for (const t of tasks) {
      if (t.status === "Completed") completed++;
      else if (t.status === "WorkInProgress") doing++;
      else todo++;
    }
    return { completed, doing, todo };
  }, [tasks]);

  if (!projectId)
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-lg">
        Thiếu projectId
      </div>
    );
  if (isProjectLoading || isTasksLoading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-lg text-blue-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải dữ liệu...
      </div>
    );
  if (projectError || tasksError)
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-lg text-red-500">
        Không thể tải dữ liệu dự án này
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
          href="/tasks"
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          Danh sách dự án
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="truncate font-semibold text-gray-700 dark:text-white">
          {project?.title || "Dự án"}
        </span>
      </div>

      {/* Project info header */}
      <div className="mb-4 flex w-full flex-col gap-4 border-b border-gray-200 bg-white px-8 py-4 dark:border-neutral-700 dark:bg-neutral-800 md:flex-row md:items-center md:justify-between">
        {/* Left: Info */}
        <div className="flex min-w-0 items-center gap-4">
          <Briefcase className="h-10 w-10 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="min-w-0">
            <div className="truncate text-2xl font-bold text-gray-800 dark:text-white">
              {project?.title || "Dự án"}
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

      {/* FILTER nhân viên */}
      <div className="mb-3 flex flex-col gap-2 px-8 md:flex-row md:items-center">
        <label className="mr-2 font-medium">Lọc theo nhân viên:</label>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded border border-gray-300 px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-100"
        >
          <option value="">Tất cả</option>
          {users
            .filter((u) => tasks.some((t) => t.assigneeID === u.id))
            .map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
        </select>
      </div>

      {/* Tổng quan theo nhân viên */}
      <div className="mb-8 px-8">
        <h2 className="mb-2 text-lg font-bold text-blue-700">
          Tổng quan task theo nhân viên
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {staffStats
            .filter((stat) => stat.total > 0)
            .map((stat) => (
              <div
                key={stat.name}
                className="rounded border bg-white p-4 shadow"
              >
                <div className="font-semibold text-blue-600">{stat.name}</div>
                <div className="mt-2 flex gap-2 text-sm">
                  <span>
                    Tổng: <b>{stat.total}</b>
                  </span>
                  <span>
                    Hoàn thành:{" "}
                    <b className="text-green-600">{stat.completed}</b>
                  </span>
                  <span>
                    Đang làm: <b className="text-yellow-600">{stat.doing}</b>
                  </span>
                  <span>
                    Chưa làm: <b className="text-gray-600">{stat.todo}</b>
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="mt-4 rounded-2xl bg-white p-4 shadow dark:bg-neutral-900 md:p-8">
        <KanbanBoard
          key={refreshKey}
          tasks={filteredTasks}
          onTaskUpdate={handleTaskUpdate}
          projectId={
            typeof projectId === "string"
              ? projectId
              : (projectId?.toString() ?? "")
          }
          projectTitle={project?.title || "Dự án"}
        />
      </div>
    </div>
  );
}
