"use client";

import { useRouter } from "next/navigation";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPrepareProjectsByAssigneeQuery } from "@/state/api/modules/projectApi";

const StaffProjectPage = () => {
  const router = useRouter();
  const { data: user } = useGetUserInfoQuery();
  const userId = user?.id;

  const {
    data: projects = [],
    isLoading,
    error,
  } = useGetPrepareProjectsByAssigneeQuery(userId!, {
    skip: !userId,
  });

  if (!userId) return <div className="p-4">Missing user ID</div>;
  if (isLoading) return <div className="p-4">Đang tải danh sách dự án...</div>;
  if (error) return <div className="p-4 text-red-500">Lỗi tải dự án</div>;

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-center text-2xl font-bold">Dự án được giao</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.projectId}
            className="cursor-pointer hover:border-blue-500"
            onClick={() => router.push(`/staff-tasks/${project.projectId}`)}
          >
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">{project.projectTitle}</h2>
              <p>{project.prepareTasks?.length || 0} task chuẩn bị</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffProjectPage;
