"use client";
import React, { useContext, useMemo, useState } from "react";
import {
  ClipboardList,
  CalendarCheck2,
  ClipboardCheck,
  User2,
} from "lucide-react";
import { Card, CardContent } from "@mui/material";
import { AuthContext } from "@/app/AuthProvider";
import { useGetTasksByUserQuery } from "@/state/api/modules/taskApi";
import { useGetNotificationsByUserQuery } from "@/state/api/modules/notificationApi";
import { Status } from "@/types/status";
import { Task } from "@/types/task";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// Utils
function statusVi(status: string) {
  switch (status) {
    case Status.ToDo:
      return "Chờ làm";
    case Status.WorkInProgress:
      return "Đang thực hiện";
    case Status.UnderReview:
      return "Chờ duyệt";
    case Status.Completed:
      return "Hoàn thành";
    default:
      return status;
  }
}

// Table component cho tasks
const PaginatedTable = ({
  columns,
  data,
  pageSize = 8,
  children,
}: {
  columns: { title: string; key: string }[];
  data: any[];
  pageSize?: number;
  children?: (row: any) => React.ReactNode;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.ceil(data.length / pageSize);
  const pagedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  React.useEffect(() => setCurrentPage(1), [data]);
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPage, p + 1));
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow dark:bg-gray-900">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            {columns.map((col) => (
              <th key={col.title} className="px-4 py-2 text-left font-semibold">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pagedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-4 text-center text-gray-400"
              >
                Không có dữ liệu
              </td>
            </tr>
          ) : children ? (
            pagedData.map(children)
          ) : (
            pagedData.map((row, i) => (
              <tr
                key={i}
                className={
                  "even:bg-gray-50 hover:bg-blue-50 dark:even:bg-gray-800 dark:hover:bg-gray-700"
                }
              >
                {columns.map((col) => (
                  <td key={col.title} className="px-4 py-2">
                    {(row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPage > 1 && (
        <div className="flex items-center justify-end gap-2 px-4 py-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
          >
            &lt;
          </button>
          <span>
            Trang {currentPage}/{totalPage}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPage}
            className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

const StaffHomePage = () => {
  const auth = useContext(AuthContext);
  const staffId = auth?.user?.id || "";
  const staffName = auth?.user?.fullName || "Nhân viên";
  const staffEmail = auth?.user?.email || "";
  const staffRole = auth?.user?.role?.roleName || "";
  const staffDept = auth?.user?.department?.name || "";

  // Query tasks & notifications
  const { data: staffTasks = [], isLoading: loadingTasks } =
    useGetTasksByUserQuery(staffId, { skip: !staffId });
  const { data: notifications = [], isLoading: loadingNotifications } =
    useGetNotificationsByUserQuery(staffId, { skip: !staffId });

  // Task stats
  const todoTasks = staffTasks.filter(
    (t: Task) => t.status === Status.ToDo,
  ).length;
  const inProgressTasks = staffTasks.filter(
    (t: Task) => t.status === Status.WorkInProgress,
  ).length;
  const underReviewTasks = staffTasks.filter(
    (t: Task) => t.status === Status.UnderReview,
  ).length;
  const completedTasks = staffTasks.filter(
    (t: Task) => t.status === Status.Completed,
  ).length;
  const totalTasks = staffTasks.length;
  const completedPercent = totalTasks
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Filter state
  const [taskFilter, setTaskFilter] = useState("");

  // Chuẩn hóa task cho table (có filter)
  const taskColumns = [
    { title: "Tiêu đề", key: "title" },
    { title: "Hạn hoàn thành", key: "endDate" },
    { title: "Trạng thái", key: "status" },
    { title: "Ưu tiên", key: "priority" },
  ];
  const filteredTaskData = useMemo(
    () =>
      staffTasks
        .map((task: Task) => ({
          ...task,
          status: statusVi(task.status),
          endDate: task.endDate
            ? new Date(task.endDate).toLocaleDateString("vi-VN")
            : "",
        }))
        .filter((task) =>
          taskColumns.some((col) =>
            ((task as any)[col.key] ?? "")
              .toString()
              .toLowerCase()
              .includes(taskFilter.toLowerCase()),
          ),
        ),
    [staffTasks, taskFilter, taskColumns],
  );

  // Notification stats (optional section)
  const notificationColumns = [
    { title: "Nội dung thông báo", key: "message" },
    { title: "Thời gian", key: "createDate" },
    { title: "Loại", key: "type" },
  ];
  const [notificationFilter, setNotificationFilter] = useState("");
  const filteredNotificationData = useMemo(
    () =>
      notifications
        .map((n: any) => ({
          ...n,
          createDate: n.createDate
            ? new Date(n.createDate).toLocaleString("vi-VN")
            : "",
        }))
        .filter((row) =>
          notificationColumns.some((col) =>
            ((row as any)[col.key] ?? "")
              .toString()
              .toLowerCase()
              .includes(notificationFilter.toLowerCase()),
          ),
        ),
    [notifications, notificationFilter, notificationColumns],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 px-2 py-8 dark:from-slate-900 dark:via-slate-950 dark:to-gray-900 md:px-8 lg:px-16">
      {/* Header cá nhân */}
      <div className="mb-10 flex flex-col items-center gap-5 rounded-2xl bg-white/80 p-6 shadow-lg dark:bg-slate-900 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 shadow-lg">
            <User2 className="text-white" size={42} />
          </div>
          <div>
            <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
              Xin chào,{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {staffName}
              </span>
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-gray-300">
              <span>
                Email:{" "}
                <span className="font-medium text-gray-700 dark:text-white">
                  {staffEmail}
                </span>
              </span>
              <span>
                Phòng ban:{" "}
                <span className="font-medium text-gray-700 dark:text-white">
                  {staffDept}
                </span>
              </span>
              <span>
                Chức vụ:{" "}
                <span className="font-medium text-gray-700 dark:text-white">
                  {staffRole}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-xl bg-blue-100 px-5 py-2 text-base font-bold text-blue-700 shadow-sm dark:bg-blue-950 dark:text-blue-200">
            Công việc: {totalTasks}
          </span>
          <span className="rounded-xl bg-green-100 px-5 py-2 text-base font-bold text-green-700 shadow-sm dark:bg-green-950 dark:text-green-200">
            Hoàn thành: {completedTasks}
          </span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl bg-gradient-to-tr from-purple-100 to-white shadow transition hover:-translate-y-1 hover:shadow-lg dark:from-purple-900 dark:to-gray-900">
          <CardContent className="flex items-center gap-4 p-5">
            <ClipboardCheck className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Công việc</p>
              <p className="text-xl font-extrabold text-purple-700 dark:text-purple-200">
                {loadingTasks ? "..." : totalTasks}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-gray-100 px-2 py-1">
                  Chờ làm: {todoTasks}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  Đang làm: {inProgressTasks}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  Chờ duyệt: {underReviewTasks}
                </span>
                <span className="rounded bg-gray-100 px-2 py-1">
                  Hoàn thành: {completedTasks}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-gradient-to-tr from-green-100 to-white shadow transition hover:-translate-y-1 hover:shadow-lg dark:from-green-900 dark:to-gray-900">
          <CardContent className="flex items-center gap-4 p-5">
            <CalendarCheck2 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Tiến độ công việc</p>
              <p className="text-xl font-extrabold text-green-600 dark:text-green-200">
                {completedPercent}%
              </p>
              <div className="mt-1 h-2 w-24 rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-400 transition-all"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-gradient-to-tr from-pink-100 to-white shadow transition hover:-translate-y-1 hover:shadow-lg dark:from-pink-900 dark:to-gray-900">
          <CardContent className="flex items-center gap-4 p-5">
            <ClipboardList className="h-8 w-8 text-pink-500" />
            <div>
              <p className="text-sm text-gray-500">Thông báo</p>
              <p className="text-xl font-extrabold text-pink-600 dark:text-pink-200">
                {loadingNotifications ? "..." : notifications.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Task table */}
      <div className="mb-8 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
          <h2 className="mb-4 text-center text-lg font-semibold">
            Biểu đồ trạng thái công việc
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[
                { name: "Chờ làm", value: todoTasks },
                { name: "Đang làm", value: inProgressTasks },
                { name: "Chờ duyệt", value: underReviewTasks },
                { name: "Hoàn thành", value: completedTasks },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Task Table */}
        <div className="space-y-7 lg:col-span-2">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Danh sách công việc</h2>
            <div className="mb-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                className="w-64 rounded border px-3 py-1 text-sm"
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
              />
              {taskFilter && (
                <button
                  onClick={() => setTaskFilter("")}
                  className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Xoá
                </button>
              )}
            </div>
            <PaginatedTable
              columns={taskColumns}
              data={filteredTaskData}
              pageSize={8}
            />
          </div>
        </div>
      </div>

      {/* Notifications Table (tuỳ chọn: có thể ẩn nếu muốn chỉ focus vào task) */}
      <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <h2 className="mb-2 text-lg font-semibold">Thông báo gần nhất</h2>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Tìm kiếm thông báo..."
            className="w-64 rounded border px-3 py-1 text-sm"
            value={notificationFilter}
            onChange={(e) => setNotificationFilter(e.target.value)}
          />
          {notificationFilter && (
            <button
              onClick={() => setNotificationFilter("")}
              className="ml-2 text-xs text-gray-400 hover:text-gray-600"
            >
              Xoá
            </button>
          )}
        </div>
        <PaginatedTable
          columns={notificationColumns}
          data={filteredNotificationData}
          pageSize={8}
        />
      </div>
    </div>
  );
};

export default StaffHomePage;
