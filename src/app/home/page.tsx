"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  Assignment,
  Schedule,
  CheckCircle,
  Cancel,
  Inventory,
  Work,
} from "@mui/icons-material";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import { useGetAssetRequestsForManagerQuery } from "@/state/api/modules/requestApi";
import { useGetBorrowedAssetsQuery } from "@/state/api/modules/borrowAssetApi";
import { useGetTasksByDepartmentQuery } from "@/state/api/modules/taskApi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";

export default function HomePage() {
  const { data: user } = useGetUserInfoQuery();
  const departmentId = user?.department?.id;

  const { data: requests = [], isLoading } =
    useGetAssetRequestsForManagerQuery();
  const { data: allTasks = [] } = useGetTasksByDepartmentQuery(departmentId!, {
    skip: !departmentId,
  });
  const { data: borrowedAssets = [] } = useGetBorrowedAssetsQuery();

  const prepareTasks = allTasks.filter((t) => t.tag === "Prepare asset");

  const pending = requests.filter((r) => r.status === "PENDING_AM");
  const approved = requests.filter((r) => r.status === "AM_APPROVED");
  const rejected = requests.filter((r) => r.status === "REJECTED");

  const assetPreparing = Array.isArray(borrowedAssets)
    ? borrowedAssets.filter((a) => a.status === "PREPARING").length
    : 0;

  const assetBorrowed = Array.isArray(borrowedAssets)
    ? borrowedAssets.filter((a) => a.status === "BORROWED").length
    : 0;

  const recentRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
    .slice(0, 5);

  const statCards = [
    {
      label: "Tổng yêu cầu",
      value: requests.length,
      icon: <Assignment color="primary" />,
    },
    {
      label: "Chờ duyệt",
      value: pending.length,
      icon: <Schedule color="warning" />,
    },
    {
      label: "Đã duyệt",
      value: approved.length,
      icon: <CheckCircle color="success" />,
    },
    {
      label: "Từ chối",
      value: rejected.length,
      icon: <Cancel color="error" />,
    },
  ];

  const requestBarData = [
    { name: "Tổng", value: requests.length },
    { name: "Chờ duyệt", value: pending.length },
    { name: "Đã duyệt", value: approved.length },
    { name: "Từ chối", value: rejected.length },
  ];

  const requestTableColumns = [
    { field: "title", headerName: "Tiêu đề", flex: 1 },
    { field: "description", headerName: "Mô tả", flex: 2 },
    { field: "status", headerName: "Trạng thái", width: 150 },
    { field: "startTime", headerName: "Ngày bắt đầu", width: 180 },
  ];

  const requestTableRows = recentRequests.map((r, i) => ({
    id: i,
    title: r.title,
    description: r.description,
    status: r.status,
    startTime: new Date(r.startTime).toLocaleDateString(),
  }));

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Xin chào, {user?.fullName || "Leader AM"}
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={4}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                {stat.icon}
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5">{stat.value}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bar Chart + Asset Cards */}
      <Grid container spacing={3} mb={4}>
        {/* Biểu đồ cột */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê yêu cầu theo trạng thái
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={requestBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Asset Status */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Inventory color="warning" />
                    <Box>
                      <Typography variant="body2">Đang chuẩn bị</Typography>
                      <Typography variant="h5" color="warning.main">
                        {assetPreparing}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Work color="success" />
                    <Box>
                      <Typography variant="body2">Đang được mượn</Typography>
                      <Typography variant="h5" color="success.main">
                        {assetBorrowed}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Danh sách yêu cầu gần đây
              </Typography>
              {isLoading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <Box sx={{ height: 400 }}>
                  <DataGrid
                    rows={requestTableRows}
                    columns={requestTableColumns}
                    paginationModel={{ pageSize: 5, page: 0 }}
                    pageSizeOptions={[5, 10, 20]}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
