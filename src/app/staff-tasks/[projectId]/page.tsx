"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import StaffKanban from "@/components/StaffKanban";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetPrepareProjectsByAssigneeQuery } from "@/state/api/modules/projectApi";
import { ProjectWithPrepareTasks } from "@/types/ProjectWithPrepareTasks ";

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

  if (!projectId) return <div className="p-4">Thiếu projectId</div>;
  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>;
  if (!project)
    return <div className="p-4 text-red-500">Không tìm thấy dự án này</div>;

  const handleTaskUpdate = async () => {
    await refetch();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: "Dự án của tôi", href: "/staff-tasks" },
          { label: project.projectTitle },
        ]}
      />

      <h1 className="text-2xl font-bold">{project.projectTitle}</h1>

      <StaffKanban
        key={refreshKey}
        tasks={project.prepareTasks}
        onTaskUpdate={handleTaskUpdate}
        projectId={project.projectId}
      />
    </div>
  );
};

export default StaffProjectDetailPage;
