"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAssetsQuery } from "@/state/api/modules/assetApi";

const AssetsTable = () => {
  const { data: assets = [], error, isLoading } = useGetAssetsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [assetTypeFilter, setAssetTypeFilter] = useState<string | null>(null);
  // Lọc các assets theo điều kiện
  const filteredAssets = useMemo(() => {
    return (
      assets?.filter((asset) => {
        const matchesName = asset.assetName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter
          ? asset.status === statusFilter
          : true;

        const matchesCategory = categoryFilter
          ? asset.category?.name === categoryFilter
          : true;

        const matchesAssetType = assetTypeFilter
          ? asset.assetType?.name === assetTypeFilter
          : true;

        return (
          matchesName && matchesStatus && matchesCategory && matchesAssetType
        );
      }) || []
    );
  }, [assets, searchTerm, statusFilter, categoryFilter, assetTypeFilter]);
  // Lấy danh sách các categories duy nhất từ các asset

  const uniqueCategories = useMemo(() => {
    const categories = assets?.map((asset) => asset.category?.name);
    return Array.from(new Set(categories)); // Lọc danh sách các category duy nhất
  }, [assets]);

  // Lấy danh sách các asset types duy nhất từ các asset
  const uniqueAssetTypes = useMemo(() => {
    const assetTypes = assets?.map((asset) => asset.assetType?.name);
    return Array.from(new Set(assetTypes)); // Lọc danh sách các asset type duy nhất
  }, [assets]);
  // Phân trang các dữ liệu đã lọc
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedAssets = filteredAssets.slice(
    startIndex,
    startIndex + pageSize,
  );

  // Xử lý thay đổi trang
  const handleNextPage = () => {
    if (currentPage * pageSize < filteredAssets.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const totalPages = Math.ceil(filteredAssets.length / pageSize);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-2">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Asset Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading assets.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Management</CardTitle>
        <CardDescription>
          Manage and view all assets in the system.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto">
        {/* Bộ lọc (Search & Filters) */}
        <div className="mb-4 flex space-x-4">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border px-4 py-2"
          />
          <select
            value={statusFilter || ""}
            onChange={(e) => setStatusFilter(e.target.value || null)}
            className="rounded-md border px-4 py-2"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={categoryFilter || ""}
            onChange={(e) => setCategoryFilter(e.target.value || null)}
            className="rounded-md border px-4 py-2"
          >
            <option value="">All Categories</option>
            {uniqueCategories?.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={assetTypeFilter || ""}
            onChange={(e) => setAssetTypeFilter(e.target.value || null)}
            className="rounded-md border px-4 py-2"
          >
            <option value="">All Asset Type</option>
            {uniqueAssetTypes?.map((assetType, index) => (
              <option key={index} value={assetType}>
                {assetType}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Name</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Buy Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Asset Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssets.map((asset) => (
              <TableRow key={asset.assetID}>
                <TableCell>{asset.assetName}</TableCell>
                <TableCell>{asset.model}</TableCell>
                <TableCell>{asset.code}</TableCell>
                <TableCell>{asset.description}</TableCell>
                <TableCell>${asset.price}</TableCell>
                <TableCell>{asset.buyDate}</TableCell>
                <TableCell>{asset.status}</TableCell>
                <TableCell>{asset.location}</TableCell>
                <TableCell>{asset.createdBy}</TableCell>
                <TableCell>{asset.category?.name || "N/A"}</TableCell>
                <TableCell>{asset.assetType?.name || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="rounded-md bg-gray-300 px-4 py-2"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="rounded-md bg-gray-300 px-4 py-2"
          >
            Next
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssetsTable;
