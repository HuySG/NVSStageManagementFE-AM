"use client";

import KanbanBoard from "@/components/KanbanBoard";
import {
  useGetPrepareTasksByProjectIdQuery,
  useGetTasksByDepartmentQuery,
} from "@/state/api/modules/taskApi";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { Task } from "@/types/task";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";

const ProjectTasksPage = () => {
  const params = useParams();
  const projectId = params?.projectId as string;

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useGetPrepareTasksByProjectIdQuery(projectId, {
    skip: !projectId,
  });
  if (!projectId) return <div className="p-4 text-center">No project ID</div>;
  if (isLoading) return <Loader className="mt-20" />;
  if (error)
    return <div className="p-4 text-red-500">Failed to load tasks</div>;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Your Department's Tasks</h1>
      <KanbanBoard tasks={tasks as Task[]} />
    </div>
  );
};

export default ProjectTasksPage;
