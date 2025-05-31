"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Typography,
  useTheme,
  alpha,
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
import { Loader2 } from "lucide-react";

export default function LeaderHomePage() {
  const theme = useTheme();
  const { data: user, isLoading: isUserLoading } = useGetUserInfoQuery();
  const departmentId = user?.department?.id;
  const { data: requests = [], isLoading: isRequestsLoading } =
    useGetAssetRequestsForManagerQuery();
  const { data: allTasks = [], isLoading: isTasksLoading } =
    useGetTasksByDepartmentQuery(departmentId!, { skip: !departmentId });
  const { data: borrowedAssets = [], isLoading: isBorrowedLoading } =
    useGetBorrowedAssetsQuery();

  const loading =
    isUserLoading || isRequestsLoading || isTasksLoading || isBorrowedLoading;

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
      icon: (
        <Assignment sx={{ fontSize: 36, color: theme.palette.primary.main }} />
      ),
      color: theme.palette.primary.light,
    },
    {
      label: "Chờ duyệt",
      value: pending.length,
      icon: (
        <Schedule sx={{ fontSize: 36, color: theme.palette.warning.main }} />
      ),
      color: alpha(theme.palette.warning.light, 0.4),
    },
    {
      label: "Đã duyệt",
      value: approved.length,
      icon: (
        <CheckCircle sx={{ fontSize: 36, color: theme.palette.success.main }} />
      ),
      color: alpha(theme.palette.success.light, 0.4),
    },
    {
      label: "Từ chối",
      value: rejected.length,
      icon: <Cancel sx={{ fontSize: 36, color: theme.palette.error.main }} />,
      color: alpha(theme.palette.error.light, 0.4),
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

  if (loading) {
    return (
      <Box className="flex h-72 items-center justify-center text-blue-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Đang tải dữ liệu...
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "background.default" }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Xin chào, {user?.fullName || "Leader AM"}
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                bgcolor: stat.color,
                borderRadius: 3,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                transition: "transform .12s",
                "&:hover": { transform: "translateY(-2px) scale(1.03)" },
                minHeight: 120,
              }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                {stat.icon}
                <Box>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    fontWeight={500}
                  >
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bar Chart + Asset Cards */}
      <Grid container spacing={3} mb={3}>
        {/* Biểu đồ cột */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Thống kê yêu cầu theo trạng thái
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={requestBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill={theme.palette.primary.main}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        {/* Asset Status */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} sx={{ height: "100%" }}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background:
                    "linear-gradient(90deg, #FFE082 0%, #FFD54F 100%)",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Inventory sx={{ fontSize: 32, color: "#FF9800" }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Đang chuẩn bị
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="#FF9800">
                        {assetPreparing}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  background:
                    "linear-gradient(90deg, #B2FF59 0%, #69F0AE 100%)",
                  borderRadius: 3,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Work sx={{ fontSize: 32, color: "#00C853" }} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        Đang được mượn
                      </Typography>
                      <Typography variant="h5" fontWeight={700} color="#00C853">
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
      <Box mt={2}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Danh sách yêu cầu gần đây
            </Typography>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={requestTableRows}
                columns={requestTableColumns}
                disableRowSelectionOnClick
                sx={{
                  borderRadius: 2,
                  "& .MuiDataGrid-columnHeaders": {
                    background: theme.palette.background.paper,
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-row": {
                    bgcolor: "background.default",
                    transition: "background 0.2s",
                  },
                  "& .MuiDataGrid-row:hover": {
                    background: alpha(theme.palette.primary.light, 0.08),
                  },
                }}
                paginationModel={{ pageSize: 5, page: 0 }}
                pageSizeOptions={[5, 10, 20]}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
