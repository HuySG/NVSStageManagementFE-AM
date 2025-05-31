"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import {
  Briefcase,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlarmClock,
} from "lucide-react";
import { useGetProjectAMByDepartmentIdQuery } from "@/state/api/modules/projectApi";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { useGetAssetsQuery } from "@/state/api/modules/assetApi";
import * as XLSX from "xlsx";

// ----------- Task Status Config (Tiếng Việt + icon) -----------
type TaskStatus = "ToDo" | "WorkInProgress" | "UnderReview" | "Completed";
const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }
> = {
  ToDo: {
    label: "Chờ xử lý",
    icon: (
      <span className="inline-block rounded-full bg-blue-100 p-2">
        <KeyRound className="h-5 w-5 text-blue-600" />
      </span>
    ),
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  WorkInProgress: {
    label: "Đang thực hiện",
    icon: (
      <span className="inline-block rounded-full bg-yellow-100 p-2">
        <AlarmClock className="h-5 w-5 text-yellow-700" />
      </span>
    ),
    color: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  UnderReview: {
    label: "Chờ duyệt",
    icon: (
      <span className="inline-block rounded-full bg-purple-100 p-2">
        <AlarmClock className="h-5 w-5 text-purple-700" />
      </span>
    ),
    color: "text-purple-700",
    bg: "bg-purple-50",
  },
  Completed: {
    label: "Hoàn thành",
    icon: (
      <span className="inline-block rounded-full bg-green-100 p-2">
        <CheckCircle2 className="h-5 w-5 text-green-700" />
      </span>
    ),
    color: "text-green-700",
    bg: "bg-green-50",
  },
};

// ----------- Asset Stats Config -----------
const ASSET_STATS_CONFIG = [
  {
    key: "inUse",
    label: "Đang mượn",
    icon: <KeyRound className="h-6 w-6 text-indigo-600" />,
    color: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  {
    key: "returned",
    label: "Đã trả",
    icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    key: "overdue",
    label: "Quá hạn",
    icon: <AlarmClock className="h-6 w-6 text-red-600" />,
    color: "text-red-700",
    bg: "bg-red-50",
  },
];

// ----------- Request Stats Config -----------
const REQUEST_STATS_CONFIG = [
  {
    key: "pending",
    label: "Chờ duyệt",
    icon: <AlarmClock className="h-6 w-6 text-yellow-600" />,
    color: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  {
    key: "approved",
    label: "Đã duyệt",
    icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    key: "rejected",
    label: "Từ chối",
    icon: <XCircle className="h-6 w-6 text-red-600" />,
    color: "text-red-700",
    bg: "bg-red-50",
  },
];

// ------------- Table component -------------
function useFilterTable(
  data: Record<string, any>[],
  columns: { title: string; key: string }[],
) {
  const [search, setSearch] = useState("");
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    return data.filter((row) =>
      columns.some((col) =>
        (row[col.key] ?? "")
          .toString()
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      ),
    );
  }, [search, data, columns]);
  return { search, setSearch, filteredData };
}

const Table = ({
  columns,
  data,
  pageSize = 10,
  search,
  setSearch,
}: {
  columns: { title: string; key: string }[];
  data: any[];
  pageSize?: number;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPage = Math.ceil(data.length / pageSize);
  const pagedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  useEffect(() => setCurrentPage(1), [search]);
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPage, p + 1));
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow dark:bg-gray-900">
      <div className="flex items-center gap-2 p-2">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-64 rounded border px-3 py-1 text-sm dark:bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="ml-2 text-xs text-gray-400 hover:text-gray-600"
          >
            Xoá
          </button>
        )}
      </div>
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
          ) : (
            pagedData.map((row, i) => (
              <tr
                key={i}
                className="even:bg-gray-50 hover:bg-blue-50 dark:even:bg-gray-800 dark:hover:bg-gray-700"
              >
                {columns.map((col) => (
                  <td key={col.title} className="px-4 py-2">
                    {row[col.key]}
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

// ----------- Stats tổng hợp đủ trạng thái ----------
const getStats = (tasks: any[]) => {
  const stats: Record<TaskStatus | "total", number> = {
    total: tasks.length,
    ToDo: 0,
    WorkInProgress: 0,
    UnderReview: 0,
    Completed: 0,
  };
  tasks.forEach((t) => {
    if (t.status in stats) stats[t.status as TaskStatus]++;
  });
  return stats;
};

// ----------- Export Excel Nhiều Sheet + In đậm header -----------
function exportAllToExcel({
  taskData,
  taskColumns,
  assetData,
  assetColumns,
  requestData,
  requestColumns,
  projectData,
  projectColumns,
  filename,
}: {
  taskData: any[];
  taskColumns: { title: string; key: string }[];
  assetData: any[];
  assetColumns: { title: string; key: string }[];
  requestData: any[];
  requestColumns: { title: string; key: string }[];
  projectData: any[];
  projectColumns: { title: string; key: string }[];
  filename: string;
}) {
  function clean(data: any[], columns: { title: string; key: string }[]) {
    return data.map((row) => {
      const obj: Record<string, any> = {};
      columns.forEach((col) => {
        let value = row[col.key];
        // Nếu là react node (span label), lấy text content
        if (typeof value === "object" && value?.props?.children) {
          value = Array.isArray(value.props.children)
            ? value.props.children
                .map((c: any) => (typeof c === "string" ? c : ""))
                .join("")
            : value.props.children;
        }
        obj[col.title] = value;
      });
      return obj;
    });
  }
  const wb = XLSX.utils.book_new();

  // helper: add bold header style
  function addSheetWithBoldHeader(
    data: any[],
    columns: { title: string; key: string }[],
    sheetName: string,
  ) {
    const ws = XLSX.utils.json_to_sheet(clean(data, columns), {
      header: columns.map((c) => c.title),
    });
    // style header
    columns.forEach((col, idx) => {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: idx })];
      if (cell && !cell.s) cell.s = {};
      if (cell) cell.s = { font: { bold: true } };
    });
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  addSheetWithBoldHeader(taskData, taskColumns, "Task chuẩn bị");
  addSheetWithBoldHeader(assetData, assetColumns, "Tài sản mượn");
  addSheetWithBoldHeader(requestData, requestColumns, "Yêu cầu mượn");
  addSheetWithBoldHeader(projectData, projectColumns, "Dự án");

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

const LeaderAMHomePage = () => {
  const { data: user } = useGetUserInfoQuery();
  const departmentId = user?.department?.id || "";

  // Lấy danh sách project
  const { data: projects = [], isLoading: loadingProjects } =
    useGetProjectAMByDepartmentIdQuery(departmentId, { skip: !departmentId });

  // Các API lấy asset và request
  const { data: borrowedAssets = [] } = useGetBorrowedAssetsQuery();
  const { data: assetRequests = [] } = useGetAssetRequestsForManagerQuery();
  const { data: assets = [] } = useGetAssetsQuery();

  // Tối ưu: tạo map assetID -> asset object để join nhanh
  const assetIdToObj = useMemo(() => {
    const map = new Map<string, any>();
    assets.forEach((a: any) => {
      map.set(a.assetID, a);
    });
    return map;
  }, [assets]);

  // Tổng hợp tất cả prepareTasks của mọi project
  const allPrepareTasks = useMemo(
    () =>
      projects.flatMap((p: any) =>
        Array.isArray(p.prepareTasks) ? p.prepareTasks : [],
      ),
    [projects],
  );

  // Stats cho prepareTasks (toàn bộ)
  const taskStats = useMemo(() => getStats(allPrepareTasks), [allPrepareTasks]);

  // Stats cho borrowed assets (toàn bộ)
  const assetStats = useMemo(() => {
    let inUse = 0,
      returned = 0,
      overdue = 0;
    borrowedAssets.forEach((item: any) => {
      if (item.status === "IN_USE") inUse += 1;
      else if (item.status === "RETURNED") returned += 1;
      else if (item.status === "OVERDUE") overdue += 1;
    });
    return { inUse, returned, overdue, total: borrowedAssets.length };
  }, [borrowedAssets]);

  // Stats cho asset requests (toàn bộ)
  const requestStats = useMemo(() => {
    let pending = 0,
      approved = 0,
      rejected = 0;
    assetRequests.forEach((item: any) => {
      if (item.status === "PENDING_AM") pending += 1;
      else if (item.status === "AM_APPROVED") approved += 1;
      else if (item.status === "REJECTED") rejected += 1;
    });
    return { pending, approved, rejected, total: assetRequests.length };
  }, [assetRequests]);

  // Columns cho bảng project
  const projectColumns = [
    { title: "Tên dự án", key: "projectTitle" },
    { title: "Số task chuẩn bị", key: "prepareTasksCount" },
  ];
  const projectData = projects.map((p: any) => ({
    ...p,
    prepareTasksCount: p.prepareTasks?.length || 0,
  }));

  // Columns cho bảng asset (có loại & danh mục)
  const assetColumns = [
    { title: "Tên tài sản", key: "assetName" },
    { title: "Mã tài sản", key: "assetID" },
    { title: "Loại tài sản", key: "assetTypeName" },
    { title: "Danh mục", key: "categoryName" },
    { title: "Trạng thái", key: "statusVi" },
  ];
  const assetData = borrowedAssets.map((a: any) => {
    const asset = assetIdToObj.get(a.assetID);
    return {
      assetName: asset?.assetName || a.assetID,
      assetID: a.assetID,
      assetTypeName: asset?.assetType?.name || "",
      categoryName: asset?.category?.name || "",
      statusVi:
        a.status === "IN_USE"
          ? "Đang mượn"
          : a.status === "RETURNED"
            ? "Đã trả"
            : a.status === "OVERDUE"
              ? "Quá hạn"
              : a.status,
    };
  });

  // Columns cho bảng request
  const requestColumns = [
    { title: "Tiêu đề yêu cầu", key: "title" },
    { title: "Người gửi", key: "requesterName" },
    { title: "Trạng thái", key: "statusVi" },
  ];
  const requestData = assetRequests.map((r: any) => ({
    title: r.title,
    requesterName: r.requesterInfo?.fullName ?? "",
    statusVi:
      r.status === "PENDING_AM"
        ? "Chờ duyệt"
        : r.status === "AM_APPROVED"
          ? "Đã duyệt"
          : r.status === "REJECTED"
            ? "Từ chối"
            : r.status,
  }));

  // Project đang chọn để show prepareTasks
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects?.[0]?.projectId || "",
  );
  useEffect(() => {
    if (projects.length && !selectedProjectId) {
      setSelectedProjectId(projects[0].projectId);
    }
  }, [projects, selectedProjectId]);

  // Tìm project được chọn
  const selectedProject = useMemo(
    () =>
      projects.find((p: any) => p.projectId === selectedProjectId) ||
      projects[0] ||
      null,
    [projects, selectedProjectId],
  );
  const prepareTasks = selectedProject?.prepareTasks || [];

  // Columns cho bảng prepareTasks
  const taskColumns = [
    { title: "Tiêu đề", key: "title" },
    { title: "Mô tả", key: "description" },
    { title: "Trạng thái", key: "status" },
    { title: "Ngày bắt đầu", key: "startDate" },
    { title: "Ngày kết thúc", key: "endDate" },
  ];
  const taskData = prepareTasks.map((t: any) => ({
    ...t,
    status: (
      <span
        className={`rounded px-2 py-1 text-xs font-semibold ${
          TASK_STATUS_CONFIG[t.status as TaskStatus]?.bg ||
          "bg-gray-100 text-gray-700"
        } ${TASK_STATUS_CONFIG[t.status as TaskStatus]?.color || "text-gray-700"}`}
      >
        {TASK_STATUS_CONFIG[t.status as TaskStatus]?.label || t.status}
      </span>
    ),
    startDate: t.startDate
      ? new Date(t.startDate).toLocaleDateString("vi-VN")
      : "",
    endDate: t.endDate ? new Date(t.endDate).toLocaleDateString("vi-VN") : "",
  }));

  // Filter & Search cho từng bảng
  const {
    search: projectSearch,
    setSearch: setProjectSearch,
    filteredData: filteredProjectData,
  } = useFilterTable(projectData, projectColumns);
  const {
    search: assetSearch,
    setSearch: setAssetSearch,
    filteredData: filteredAssetData,
  } = useFilterTable(assetData, assetColumns);
  const {
    search: requestSearch,
    setSearch: setRequestSearch,
    filteredData: filteredRequestData,
  } = useFilterTable(requestData, requestColumns);
  const {
    search: taskSearch,
    setSearch: setTaskSearch,
    filteredData: filteredTaskData,
  } = useFilterTable(taskData, taskColumns);

  // ---------------- Layout ----------------
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="relative mb-8 flex items-center gap-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 to-sky-100 p-6 shadow dark:from-sky-950 dark:to-amber-950">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-amber-400 to-sky-500 shadow-lg">
          <Briefcase className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="mb-1 text-3xl font-black leading-tight tracking-tight text-gray-900 dark:text-white">
            Xin chào,{" "}
            <span className="text-amber-600 dark:text-amber-400">
              {user?.fullName || "Leader AM"}
            </span>
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300">
            Trang tổng quan quản lý tài sản của bạn.
          </p>
        </div>
        {/* SVG deco */}
        <svg
          className="absolute right-8 top-4 opacity-10"
          width={120}
          height={120}
          fill="none"
          viewBox="0 0 120 120"
        >
          <circle cx={60} cy={60} r={50} stroke="#60A5FA" strokeWidth={6} />
        </svg>
      </div>

      {/* Nút xuất Excel nhiều sheet */}
      <div className="mb-2 flex justify-end">
        <button
          className="rounded bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700"
          onClick={() =>
            exportAllToExcel({
              taskData: filteredTaskData,
              taskColumns,
              assetData: filteredAssetData,
              assetColumns,
              requestData: filteredRequestData,
              requestColumns,
              projectData: filteredProjectData,
              projectColumns,
              filename: "Bao_cao_quan_ly_tai_san",
            })
          }
        >
          Xuất tất cả (Excel nhiều sheet)
        </button>
      </div>

      {/* Stats Section */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Stats Task */}
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900">
          <h3 className="mb-3 text-base font-bold text-blue-700 dark:text-blue-300">
            Thống kê Task Chuẩn Bị Tài Sản
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((status) => {
              const { label, icon, color, bg } = TASK_STATUS_CONFIG[status];
              return (
                <div
                  key={status}
                  className={`flex flex-col items-center rounded-xl p-4 shadow-sm ${bg} transition-transform hover:-translate-y-1`}
                >
                  {icon}
                  <span className={`mt-2 font-semibold ${color}`}>{label}</span>
                  <span className="mt-1 text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                    {taskStats[status]}
                  </span>
                </div>
              );
            })}
            <div className="flex flex-col items-center rounded-xl bg-gray-100 p-4 shadow-sm dark:bg-gray-800">
              <span className="inline-block rounded-full bg-gray-300 p-2">
                <svg
                  className="h-5 w-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
              </span>
              <span className="mt-2 font-semibold text-gray-600">Tổng</span>
              <span className="mt-1 text-2xl font-extrabold text-gray-700 dark:text-gray-200">
                {taskStats.total}
              </span>
            </div>
          </div>
        </div>
        {/* Stats Asset */}
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900">
          <h3 className="mb-3 text-base font-bold text-indigo-700 dark:text-indigo-300">
            Thống kê Tài Sản Đang Mượn
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ASSET_STATS_CONFIG.map((stat) => (
              <div
                key={stat.key}
                className={`flex flex-col items-center rounded-xl p-4 shadow-sm ${stat.bg} transition-transform hover:-translate-y-1`}
              >
                {stat.icon}
                <span className={`mt-2 font-semibold ${stat.color}`}>
                  {stat.label}
                </span>
                <span className="mt-1 text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                  {assetStats[stat.key as keyof typeof assetStats]}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center rounded-xl bg-gray-100 p-4 shadow-sm dark:bg-gray-800">
              <span className="inline-block rounded-full bg-gray-300 p-2">
                <svg
                  className="h-5 w-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
              </span>
              <span className="mt-2 font-semibold text-gray-600">Tổng</span>
              <span className="mt-1 text-2xl font-extrabold text-gray-700 dark:text-gray-200">
                {assetStats.total}
              </span>
            </div>
          </div>
        </div>
        {/* Stats Request */}
        <div className="rounded-2xl bg-white p-4 shadow dark:bg-gray-900">
          <h3 className="mb-3 text-base font-bold text-yellow-700 dark:text-yellow-300">
            Thống kê Yêu Cầu Mượn Tài Sản
          </h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {REQUEST_STATS_CONFIG.map((stat) => (
              <div
                key={stat.key}
                className={`flex flex-col items-center rounded-xl p-4 shadow-sm ${stat.bg} transition-transform hover:-translate-y-1`}
              >
                {stat.icon}
                <span className={`mt-2 font-semibold ${stat.color}`}>
                  {stat.label}
                </span>
                <span className="mt-1 text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                  {requestStats[stat.key as keyof typeof requestStats]}
                </span>
              </div>
            ))}
            <div className="flex flex-col items-center rounded-xl bg-gray-100 p-4 shadow-sm dark:bg-gray-800">
              <span className="inline-block rounded-full bg-gray-300 p-2">
                <svg
                  className="h-5 w-5 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <circle cx="10" cy="10" r="8" />
                </svg>
              </span>
              <span className="mt-2 font-semibold text-gray-600">Tổng</span>
              <span className="mt-1 text-2xl font-extrabold text-gray-700 dark:text-gray-200">
                {requestStats.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Project List */}
      <div>
        <div className="mb-2 flex justify-between">
          <h2 className="text-lg font-semibold">Danh sách dự án</h2>
        </div>
        <Table
          columns={projectColumns}
          data={filteredProjectData}
          pageSize={5}
          search={projectSearch}
          setSearch={setProjectSearch}
        />
        {projects.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Chọn dự án:</span>
            {projects.map((p: any) => (
              <button
                key={p.projectId}
                onClick={() => setSelectedProjectId(p.projectId)}
                className={`rounded border px-3 py-1 text-xs font-semibold transition ${
                  selectedProjectId === p.projectId
                    ? "border-blue-500 bg-blue-500 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-blue-50 dark:bg-gray-900 dark:text-gray-100"
                }`}
              >
                {p.projectTitle}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prepare Tasks for selected Project */}
      <div>
        <div className="mb-2 flex justify-between">
          <h2 className="text-lg font-semibold">
            Danh sách task chuẩn bị tài sản{" "}
            {selectedProject && <>({selectedProject.projectTitle})</>}
          </h2>
        </div>
        <Table
          columns={taskColumns}
          data={filteredTaskData}
          pageSize={7}
          search={taskSearch}
          setSearch={setTaskSearch}
        />
      </div>

      {/* Asset List */}
      <div>
        <div className="mb-2 flex justify-between">
          <h2 className="text-lg font-semibold">Tài sản đang mượn</h2>
        </div>
        <Table
          columns={assetColumns}
          data={filteredAssetData}
          pageSize={7}
          search={assetSearch}
          setSearch={setAssetSearch}
        />
      </div>

      {/* Request List */}
      <div>
        <div className="mb-2 flex justify-between">
          <h2 className="text-lg font-semibold">Yêu cầu mượn tài sản</h2>
        </div>
        <Table
          columns={requestColumns}
          data={filteredRequestData}
          pageSize={7}
          search={requestSearch}
          setSearch={setRequestSearch}
        />
      </div>
    </div>
  );
};

export default LeaderAMHomePage;
