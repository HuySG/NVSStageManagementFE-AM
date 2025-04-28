"use client";

import React from "react";
import { useGetCheckAvailabilityResultQuery } from "@/state/api/modules/requestApi";
import AvailableAssetList from "@/components/AvailableAssetList"; // Đảm bảo bạn có component này
import { format } from "date-fns";

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
    return <p className="text-sm text-gray-500">🔄 Checking availability...</p>;

  if (isError) {
    console.error("Availability check error:", error);
    return (
      <p className="text-sm text-red-500">❌ Failed to check availability.</p>
    );
  }

  if (!result) return null;

  const missingCategories =
    result.missingCategories && !Array.isArray(result.missingCategories)
      ? Object.values(result.missingCategories)
      : (result.missingCategories ?? []);

  return (
    <div className="space-y-5 text-sm">
      {/* Availability summary */}
      {result.available ? (
        <div className="font-medium text-green-600">
          ✔️ All requested assets are available.
        </div>
      ) : (
        <div className="font-medium text-red-600">
          ❌ Some requested categories are missing required assets.
        </div>
      )}

      {/* Available assets list */}
      {result.availableAssets && result.availableAssets.length > 0 && (
        <AvailableAssetList assets={result.availableAssets} />
      )}

      {/* Missing categories section */}
      {missingCategories.length > 0 && (
        <div>
          <h4 className="mb-2 font-semibold text-gray-800">
            Missing Categories:
          </h4>
          <ul className="space-y-3">
            {missingCategories.map((cat) => (
              <li
                key={cat.categoryId}
                className="rounded-md border border-red-200 bg-red-50 p-4 text-gray-800"
              >
                <div className="mb-1 text-base font-semibold text-red-700">
                  {cat.categoryName}
                </div>
                <ul className="space-y-1 text-sm">
                  <li>
                    • Requested: <strong>{cat.requestedQuantity}</strong>
                  </li>
                  <li>
                    • Available now:{" "}
                    <strong
                      className={cat.availableNow === 0 ? "text-red-600" : ""}
                    >
                      {cat.availableNow}
                    </strong>
                  </li>
                  <li>
                    • Shortage: <strong>{cat.shortage}</strong>
                  </li>
                  <li>
                    • Next available time:{" "}
                    {cat.nextAvailableTime ? (
                      <strong>
                        {format(
                          new Date(cat.nextAvailableTime),
                          "dd MMM yyyy, HH:mm",
                        )}
                      </strong>
                    ) : (
                      <span className="italic text-gray-500">
                        No estimate available
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
