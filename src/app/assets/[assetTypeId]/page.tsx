"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Search, ChevronRight, Boxes } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetAssetsQuery } from "@/state/api/modules/assetApi";

const AssetCategoriesPage = () => {
  const { assetTypeId } = useParams() as { assetTypeId: string };
  const { data: assets = [], isLoading, error } = useGetAssetsQuery();
  const [search, setSearch] = useState("");

  // Lọc tài sản theo kiểu tài sản đang chọn
  const assetsOfType = useMemo(
    () => assets.filter((a) => a.assetType?.id === assetTypeId),
    [assets, assetTypeId],
  );
  const assetTypeName = assetsOfType[0]?.assetType?.name || "Kiểu tài sản";

  // Gom các loại tài sản (categories) thuộc kiểu đang chọn
  const categories = useMemo(() => {
    const map = new Map();
    assetsOfType.forEach((asset) => {
      const cat = asset.category;
      if (cat) {
        if (!map.has(cat.categoryID)) {
          map.set(cat.categoryID, { ...cat, count: 1 });
        } else {
          map.get(cat.categoryID).count += 1;
        }
      }
    });
    return Array.from(map.values()).filter((cat) =>
      cat.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [assetsOfType, search]);

  // Tổng số loại và tổng số tài sản thuộc kiểu này
  const totalCategories = categories.length;
  const totalAssets = assetsOfType.length;

  // Loading & Error UI
  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-400">
        Đang tải loại tài sản...
      </div>
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
        <Link href="/" className="text-blue-700 hover:underline">
          Trang chủ
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/assets" className="text-blue-700 hover:underline">
          Tài sản
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-gray-700">{assetTypeName}</span>
      </nav>

      {/* Header */}
      <header className="w-full border-b border-gray-200 bg-white px-8 py-8 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 dark:text-white">
              <Layers className="h-8 w-8 text-blue-500" />
              Loại tài sản: {assetTypeName}
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Danh sách các loại tài sản thuộc kiểu{" "}
              <span className="font-semibold">{assetTypeName}</span>.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Search className="mr-2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm loại tài sản..."
                className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-base shadow-sm outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {/* Thống kê */}
          <div className="flex flex-col items-start gap-2 md:items-end md:gap-2">
            <span className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng loại:&nbsp;
              <span className="text-lg font-bold text-blue-600">
                {totalCategories}
              </span>
            </span>
            <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
              Tổng tài sản:&nbsp;
              <span className="text-lg font-bold text-yellow-600">
                {totalAssets}
              </span>
            </span>
          </div>
        </div>
      </header>

      {/* Danh sách loại tài sản */}
      <main className="w-full px-8 py-10">
        {categories.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            Không có loại tài sản nào phù hợp.
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.categoryID}
                href={`/assets/${assetTypeId}/${cat.categoryID}`}
                className="group flex flex-col items-start rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:from-neutral-800 dark:to-neutral-900"
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 transition group-hover:bg-blue-100 dark:bg-blue-900">
                  <Boxes className="h-8 w-8 text-blue-600 group-hover:text-blue-700 dark:text-blue-400" />
                </div>
                <div className="mb-2 line-clamp-2 min-h-[48px] break-words text-lg font-bold text-gray-800 group-hover:text-blue-700 dark:text-white">
                  {cat.name}
                </div>
                <span className="mt-1 inline-block rounded-full bg-yellow-200 px-4 py-1.5 text-sm font-semibold text-yellow-800 shadow-sm">
                  {cat.count} tài sản
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AssetCategoriesPage;
