"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Briefcase, Search } from "lucide-react";
import { useGetAssetsQuery } from "@/state/api/modules/assetApi";

const AssetTypesPage = () => {
  const { data: assets = [], isLoading, error } = useGetAssetsQuery();
  const [search, setSearch] = useState("");

  // Lấy danh sách kiểu tài sản duy nhất và filter theo search
  const assetTypes = useMemo(() => {
    const typeMap = new Map<string, any>();
    assets.forEach((a) => {
      if (a.assetType && a.assetType.id && a.assetType.name) {
        typeMap.set(a.assetType.id, a.assetType);
      }
    });
    return Array.from(typeMap.values())
      .filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [assets, search]);

  const totalTypes = assetTypes.length;

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">
        Đang tải kiểu tài sản...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500">
        Không thể tải dữ liệu kiểu tài sản.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <Briefcase className="h-8 w-8 text-blue-500" />
              Quản lý Kiểu tài sản
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Danh sách các kiểu tài sản, chọn để xem các loại bên trong.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm kiểu tài sản..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Tổng số kiểu tài sản */}
            <div className="mt-4">
              <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                Tổng kiểu tài sản:&nbsp;
                <span className="text-lg font-bold text-blue-600">
                  {totalTypes}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-8 py-10">
        {assetTypes.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có kiểu tài sản nào.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {assetTypes.map((type) => (
              <Link
                key={type.id}
                href={`/assets/${type.id}`}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100 dark:bg-blue-900">
                  <Briefcase className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
                </div>
                <div className="mb-2 min-h-[48px] break-words text-lg font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                  {type.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssetTypesPage;
