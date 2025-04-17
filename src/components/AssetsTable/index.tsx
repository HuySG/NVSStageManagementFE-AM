"use client";

import { useGetAssetsQuery } from "@/state/api/modules/assetApi";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import Image from "next/image";

const AssetsTable = () => {
  const { data: assets, error, isLoading } = useGetAssetsQuery();
  const columns: GridColDef[] = [
    { field: "assetName", headerName: "Asset Name", flex: 1 },
    { field: "model", headerName: "Model", flex: 1 },
    { field: "code", headerName: "Code", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    { field: "price", headerName: "Price", flex: 1, type: "number" },
    { field: "buyDate", headerName: "Buy Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "createdBy", headerName: "Created By", flex: 1 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueGetter: (params) => (params as any)?.row?.category?.name || "N/A",
    },
    {
      field: "assetType",
      headerName: "Asset Type",
      flex: 1,
      valueGetter: (params) => (params as any)?.assetType?.name || "N/A",
    },
    {
      field: "image",
      headerName: "Image",
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <Image
            src={params.value}
            alt="Asset Image"
            width={50}
            height={50}
            className="rounded-md"
          />
        ) : (
          "No Image"
        ),
    },
  ];

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error)
    return <p className="text-center text-red-500">Error loading assets</p>;

  return (
    <div className="rounded-md bg-white p-4 shadow">
      <h1 className="mb-4 text-lg font-bold">Asset Management</h1>
      <DataGrid
        rows={assets || []}
        columns={columns}
        getRowId={(row) => row.assetID}
        pageSizeOptions={[5, 10, 20]}
        autoHeight
      />
    </div>
  );
};

export default AssetsTable;
