"use client";

import React from "react";
import { useGetCheckAvailabilityResultQuery } from "@/state/api/modules/requestApi";
import AvailableAssetList from "@/components/AvailableAssetList";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface CheckAvailabilityDisplayProps {
  requestId: string;
}

const CheckAvailabilityDisplay: React.FC<CheckAvailabilityDisplayProps> = ({
  requestId,
}) => {
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useGetCheckAvailabilityResultQuery(requestId);

  if (isLoading)
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="h-5 w-5 animate-spin text-blue-500" viewBox="0 0 24 24">
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        Đang kiểm tra khả dụng tài sản...
      </div>
    );

  if (isError) {
    console.error("Availability check error:", error);
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <XCircle className="h-5 w-5" />
        Không thể kiểm tra khả dụng tài sản.
      </div>
    );
  }

  if (!result) return null;

  const missingCategories =
    result.missingCategories && !Array.isArray(result.missingCategories)
      ? Object.values(result.missingCategories)
      : (result.missingCategories ?? []);

  return (
    <div className="space-y-6 text-sm">
      {/* Tổng quan trạng thái */}
      {result.available ? (
        <div className="flex items-center gap-2 font-semibold text-green-700">
          <CheckCircle className="h-5 w-5" />
          Tất cả tài sản/loại tài sản yêu cầu đều đang sẵn sàng.
        </div>
      ) : (
        <div className="flex items-center gap-2 font-semibold text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Có loại tài sản chưa đủ số lượng cần thiết.
        </div>
      )}

      {/* Danh sách tài sản sẵn sàng */}
      {result.availableAssets && result.availableAssets.length > 0 && (
        <div>
          <h4 className="mb-2 text-base font-bold text-blue-700">
            Danh sách tài sản sẵn sàng:
          </h4>
          <AvailableAssetList assets={result.availableAssets} />
        </div>
      )}

      {/* Loại tài sản thiếu */}
      {missingCategories.length > 0 && (
        <div>
          <h4 className="mb-3 text-base font-bold text-red-700">
            Các loại tài sản thiếu
          </h4>
          <ul className="space-y-4">
            {missingCategories.map((cat) => (
              <li
                key={cat.categoryId}
                className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950"
              >
                <div className="mb-2 text-base font-semibold text-red-700">
                  {cat.categoryName}
                </div>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-700 dark:text-gray-200">
                  <li>
                    • <span className="font-medium">Yêu cầu:</span>{" "}
                    <span className="font-bold">{cat.requestedQuantity}</span>
                  </li>
                  <li>
                    • <span className="font-medium">Đang có:</span>{" "}
                    <span
                      className={
                        cat.availableNow === 0
                          ? "font-bold text-red-600"
                          : "font-bold"
                      }
                    >
                      {cat.availableNow}
                    </span>
                  </li>
                  <li>
                    • <span className="font-medium">Thiếu:</span>{" "}
                    <span className="font-bold text-orange-600">
                      {cat.shortage}
                    </span>
                  </li>
                  <li>
                    • <span className="font-medium">Sớm nhất có thể:</span>{" "}
                    {cat.nextAvailableTime ? (
                      <span className="font-semibold text-blue-700">
                        {format(
                          new Date(cat.nextAvailableTime),
                          "dd/MM/yyyy, HH:mm",
                        )}
                      </span>
                    ) : (
                      <span className="italic text-gray-500">
                        Không có thông tin
                      </span>
                    )}
                  </li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CheckAvailabilityDisplay;
