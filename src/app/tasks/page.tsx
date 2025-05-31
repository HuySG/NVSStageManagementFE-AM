"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { Briefcase, Clock, ListChecks } from "lucide-react";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetProjectAMByDepartmentIdQuery } from "@/state/api/modules/projectApi";
import { format } from "date-fns";

export default function LeaderAMProjectsPage() {
  // Lấy thông tin user (và departmentId)
  const { data: user, isLoading, error } = useGetUserInfoQuery();
  const departmentId = user?.department?.id;

  // Lấy danh sách project của department AM
  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useGetProjectAMByDepartmentIdQuery(departmentId!, {
    skip: !departmentId,
  });

  // Luôn đảm bảo projects là mảng
  const projects = Array.isArray(projectsData) ? projectsData : [];

  // Gom tất cả task trong toàn bộ project (nếu cần thống kê tổng)
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

  // Loading & error UI
  if (!departmentId)
    return (
      <div className="p-10 text-center text-gray-400">Không có phòng ban</div>
    );
  if (isLoading || isProjectsLoading)
    return <div className="p-10 text-center">Đang tải dự án...</div>;
  if (error || projectsError)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải danh sách dự án
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <ListChecks className="h-8 w-8 text-blue-500" />
              Dự án của phòng ban AM
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Danh sách dự án mà phòng ban của bạn đang phụ trách hoặc tham gia
              thực hiện.
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
      </header>

      {/* Danh sách dự án */}
      <main className="w-full px-8 py-8">
        {projects.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            Không có dự án nào.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {projects.map((project: any) => {
              // Lấy ngày bắt đầu/kết thúc đầu tiên trong danh sách task, nếu có
              const firstTask =
                Array.isArray(project.prepareTasks) &&
                project.prepareTasks.length > 0
                  ? project.prepareTasks[0]
                  : {};
              // Gom lại số lượng task từng trạng thái trong project
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
                  href={`/tasks/${project.projectId}`}
                  key={project.projectId}
                  className="group flex h-full flex-col rounded-xl border border-gray-200 bg-white p-6 shadow transition hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
                >
                  <div className="mb-4">
                    <Briefcase className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-lg font-bold text-gray-800 group-hover:text-blue-600 dark:text-white">
                    {project.projectTitle}
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
