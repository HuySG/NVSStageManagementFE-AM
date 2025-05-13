"use client";

import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { Card, CardContent } from "@/components/ui/card";
import { useGetPrepareProjectsByAssigneeQuery } from "@/state/api/modules/projectApi";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";

export default function StaffDashboard() {
  const { data: user } = useGetUserInfoQuery();
  const { data: prepareProjects = [] } = useGetPrepareProjectsByAssigneeQuery(
    user?.id!,
    { skip: !user?.id },
  );
  const { data: borrowedAssets = [] } = useGetBorrowedAssetsQuery();

  const totalTasks = prepareProjects.reduce(
    (acc, project) => acc + project.prepareTasks.length,
    0,
  );
  const completedTasks = prepareProjects.reduce(
    (acc, project) =>
      acc + project.prepareTasks.filter((t) => t.status === "Completed").length,
    0,
  );

  const preparingAssets = borrowedAssets.filter(
    (a) => a.status === "PREPARING",
  ).length;
  const borrowedCount = borrowedAssets.filter(
    (a) => a.status === "BORROWED",
  ).length;

  return (
    <main className="space-y-10 p-6">
      <h1 className="text-2xl font-bold">
        Xin chào, {user?.fullName || "Staff"}
      </h1>

      {/* Tổng quan Task */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Tổng số task chuẩn bị</p>
            <p className="text-2xl font-semibold text-gray-800">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Đã hoàn thành</p>
            <p className="text-2xl font-semibold text-green-600">
              {completedTasks}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tài sản liên quan */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Tài sản đang chuẩn bị</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {preparingAssets}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Tài sản đang được mượn</p>
            <p className="text-2xl font-semibold text-blue-600">
              {borrowedCount}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
