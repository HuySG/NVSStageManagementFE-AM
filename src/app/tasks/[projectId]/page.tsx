"use client";

import Breadcrumb from "@/components/Breadcrumb";
import KanbanBoard from "@/components/KanbanBoard";
import { useGetProjectDetailsByIdQuery } from "@/state/api/modules/projectApi";
import { useGetPrepareTasksByProjectIdQuery } from "@/state/api/modules/taskApi";
import { Task } from "@/types/task";
import { Loader } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ProjectTasksPage = () => {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useGetPrepareTasksByProjectIdQuery(projectId, {
    skip: !projectId,
  });
  const { data: project, isLoading: isProjectLoading } =
    useGetProjectDetailsByIdQuery(projectId, {
      skip: !projectId,
    });
  const handleTaskUpdate = async () => {
    await refetch();
    setRefreshKey((prev) => prev + 1);
  };
  const searchParams = useSearchParams();
  const shouldRefresh = searchParams.get("updated") === "true";

  useEffect(() => {
    if (shouldRefresh) {
      refetch(); // cập nhật task mới nhất
    }
  }, [shouldRefresh]);

  if (!projectId) return <div className="p-4 text-center">No project ID</div>;
  if (isLoading) return <Loader className="mt-20" />;
  if (error)
    return <div className="p-4 text-red-500">Failed to load tasks</div>;

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: "Project", href: "/tasks" },
          { label: project?.title || "Project" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        {isProjectLoading ? "Đang tải..." : project?.title || "Dự án"}
      </h1>

      <KanbanBoard
        key={refreshKey}
        tasks={tasks as Task[]}
        onTaskUpdate={handleTaskUpdate}
        projectId={projectId}
        projectTitle={project?.title || "Project"}
      />
    </div>
  );
};

export default ProjectTasksPage;
