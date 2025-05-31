"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Box, Search, ChevronRight, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import {
  useGetAssetsQuery,
  useCreateAssetMutation,
} from "@/state/api/modules/assetApi";
import { useGetUserInfoQuery } from "@/state/api/modules/userApi";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog } from "@headlessui/react";
import { toast } from "react-toastify";
import { AssetCreate } from "@/types/asset"; // Đã import interface

const AssetListPage = () => {
  const { assetTypeId, categoryId } = useParams() as {
    assetTypeId: string;
    categoryId: string;
  };
  const { data: assets = [], isLoading, error, refetch } = useGetAssetsQuery();
  const { data: user } = useGetUserInfoQuery();
  const [createAsset, { isLoading: creating }] = useCreateAssetMutation();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // FORM STATE
  const [assetName, setAssetName] = useState("");
  const [code, setCode] = useState("");
  const [model, setModel] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("AVAILABLE");

  // Lọc tài sản theo kiểu + loại + tìm kiếm tên
  const filteredAssets = useMemo(() => {
    return assets.filter(
      (a) =>
        a.assetType?.id === assetTypeId &&
        a.category?.categoryID === categoryId &&
        a.assetName.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [assets, assetTypeId, categoryId, search]);

  // Lấy tên loại và kiểu tài sản
  const categoryName = filteredAssets[0]?.category?.name || "Loại tài sản";
  const assetTypeName = filteredAssets[0]?.assetType?.name || "Kiểu tài sản";

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.fullName) {
      toast.error("Không lấy được thông tin người tạo!");
      return;
    }
    const data: AssetCreate = {
      assetName,
      code,
      model,
      description,
      status,
      categoryID: categoryId,
      assetTypeID: assetTypeId,
      createdBy: user.fullName,
    };
    try {
      await createAsset(data).unwrap();
      toast.success("Tạo tài sản thành công!");
      setOpen(false);
      // Reset form
      setAssetName("");
      setCode("");
      setModel("");
      setDescription("");
      setStatus("AVAILABLE");
      refetch();
    } catch {
      toast.error("Tạo tài sản thất bại!");
    }
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">Đang tải tài sản...</div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 px-8 pt-8 text-sm text-gray-500 md:gap-2">
        <Link href="/assets" className="text-blue-700 hover:underline">
          Tài sản
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/assets/${assetTypeId}`}
          className="text-blue-700 hover:underline"
        >
          {assetTypeName}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-gray-700">{categoryName}</span>
      </nav>

      {/* Header + Filter */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          {/* Info chính bên trái */}
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <Box className="h-8 w-8 text-blue-500" />
              {categoryName}
            </h1>
            <div className="mt-2 flex flex-col gap-1 text-base text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  Kiểu tài sản:
                </span>{" "}
                {assetTypeName}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  Loại tài sản:
                </span>{" "}
                {categoryName}
              </div>
              <div>
                <span className="font-semibold text-gray-800 dark:text-white">
                  Tổng tài sản:
                </span>{" "}
                <span className="text-lg font-bold text-blue-600">
                  {filteredAssets.length}
                </span>
              </div>
            </div>
          </div>

          {/* Bộ lọc & nút thêm bên phải */}
          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex items-center gap-2">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm tài sản..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700"
            >
              <Plus className="h-5 w-5" /> Thêm tài sản
            </button>
          </div>
        </div>
      </header>

      {/* Modal Thêm tài sản */}
      <Dialog open={open} onClose={() => setOpen(false)} className="fixed z-40">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <Dialog.Title className="mb-4 text-lg font-bold text-blue-600">
              Thêm tài sản mới
            </Dialog.Title>
            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Tên tài sản</label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  required
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mã tài sản</label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Model</label>
                <input
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Mô tả</label>
                <textarea
                  className="mt-1 w-full rounded border px-3 py-2"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Trạng thái</label>
                <select
                  className="mt-1 w-full rounded border px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="AVAILABLE">Sẵn sàng</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded px-4 py-2 text-gray-500 hover:bg-gray-100"
                  onClick={() => setOpen(false)}
                  disabled={creating}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                  disabled={creating}
                >
                  {creating ? "Đang tạo..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Table */}
      <main className="w-full px-8 py-10">
        <div className="overflow-auto rounded-2xl border border-gray-100 bg-white p-4 shadow dark:bg-neutral-900">
          {filteredAssets.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              Không có tài sản nào thuộc loại này.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên tài sản</TableHead>
                  <TableHead>Mã</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Mô tả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow
                    key={asset.assetID}
                    className="cursor-pointer transition hover:bg-blue-50/50 dark:hover:bg-slate-800"
                  >
                    <TableCell className="font-semibold text-blue-800 dark:text-blue-300">
                      {asset.assetName}
                    </TableCell>
                    <TableCell>{asset.code}</TableCell>
                    <TableCell>{asset.model}</TableCell>
                    <TableCell>
                      <span
                        className={
                          asset.status === "AVAILABLE"
                            ? "font-semibold text-green-600"
                            : asset.status === "INACTIVE"
                              ? "font-semibold text-gray-400"
                              : "font-semibold text-yellow-600"
                        }
                      >
                        {asset.status === "AVAILABLE"
                          ? "Sẵn sàng"
                          : asset.status === "INACTIVE"
                            ? "Không hoạt động"
                            : asset.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600">
                      {asset.description || "--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssetListPage;
