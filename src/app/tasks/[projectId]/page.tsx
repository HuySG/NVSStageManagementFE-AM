"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useGetTasksByDepartmentQuery } from "@/state/api/modules/taskApi";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { Card, CardContent } from "@/components/ui/card";
import { log } from "console";

const ProjectTasksPage = () => {
  const { projectId } = useParams();
  const projectIdStr = Array.isArray(projectId)
    ? projectId[0]
    : (projectId ?? "");

  const { data: user } = useGetUserInfoQuery();
  const departmentId = user?.department?.id;

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useGetTasksByDepartmentQuery(departmentId!, {
    skip: !departmentId,
  });

  const projectTasks = tasks.filter(
    (task) => task.projectID?.projectID === projectIdStr,
  );
  console.log("departmentId:", departmentId); // giá trị phải khác undefined
  console.log("user:", user); // phải chứa department.id

  if (!departmentId)
    return <div className="p-4 text-center">Missing department ID</div>;
  if (isLoading) return <div className="p-4 text-center">Loading tasks...</div>;
  if (error)
    return <div className="p-4 text-red-500">Failed to load tasks</div>;

  return (
    <div className="p-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Tasks in Project</h1>

      {projectTasks.length === 0 ? (
        <div className="text-center text-gray-500">No tasks found.</div>
      ) : (
        <div className="space-y-4">
          {projectTasks.map((task) => (
            <Card key={task.taskID}>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {task.title}
                </h2>
                <p className="text-sm text-gray-600">Tag: {task.tag}</p>
                <p className="text-sm text-gray-600">Status: {task.status}</p>
                <p className="text-sm text-gray-600">
                  Assignee: {task.assigneeInfo?.fullName ?? "Unassigned"}
                </p>
                <p className="text-sm text-gray-600">
                  {task.startDate} ➔ {task.endDate}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTasksPage;
