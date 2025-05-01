"use client";

import React from "react";
import { useGetProjectsDepartmentQuery } from "@/state/api/modules/projectApi";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const TasksPage = () => {
  const { data: user } = useGetUserInfoQuery();
  const departmentId = user?.department?.id;

  const {
    data: projects = [],
    isLoading,
    error,
  } = useGetProjectsDepartmentQuery(departmentId!, {
    skip: !departmentId,
  });

  if (!departmentId)
    return <div className="p-4 text-center">Missing department ID</div>;
  if (isLoading)
    return <div className="p-4 text-center">Loading projects...</div>;
  if (error)
    return <div className="p-4 text-red-500">Failed to load projects</div>;

  return (
    <div className="p-8">
      <h1 className="mb-8 text-center text-3xl font-bold">
        My Department's Projects
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.projectID} href={`/tasks/${project.projectID}`}>
            <Card className="cursor-pointer transition hover:border-blue-400">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">{project.title}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TasksPage;
