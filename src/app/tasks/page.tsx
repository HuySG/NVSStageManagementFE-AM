"use client";

import React from "react";
import { useGetProjectAMByDepartmentIdQuery } from "@/state/api/modules/projectApi";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban } from "lucide-react";

const TasksPage = () => {
  const { data: user } = useGetUserInfoQuery();
  const departmentId = user?.department?.id;

  const {
    data: projects = [],
    isLoading,
    error,
  } = useGetProjectAMByDepartmentIdQuery(departmentId!, {
    skip: !departmentId,
  });

  if (!departmentId)
    return (
      <div className="p-4 text-center text-gray-500">Không có phòng ban</div>
    );
  if (isLoading)
    return (
      <div className="p-4 text-center text-gray-500">Đang tải dự án...</div>
    );
  if (error)
    return (
      <div className="p-4 text-center text-red-500">Không thể tải dự án</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      {/* Header giống BorrowAssetsOverviewPage */}
      <div className="mb-6 flex flex-col border-b pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Danh sách dự án của phòng ban
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Các dự án mà phòng ban của bạn đang phụ trách hoặc tham gia thực
            hiện.
          </p>
          <p className="mt-1 text-sm font-semibold text-indigo-600">
            Tổng số dự án: {projects.length}
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-center text-gray-500">Không có dự án nào.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
            <Link
              key={project.projectId}
              href={`/tasks/${project.projectId}`}
              className="group"
            >
              <Card className="h-full cursor-pointer border border-gray-200 shadow-sm transition duration-200 hover:border-blue-500 hover:shadow-md">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                      {project.projectTitle}
                    </h2>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
