import { AssetRequest } from "@/types/assetRequest";
import { BorrowedAsset } from "@/types/borrowedAsset";
import { CheckAvailabilityResult } from "@/types/checkAvailabilityResult";

export const dataGridClassNames =
  "border border-gray-200 bg-white shadow dark:border-stroke-dark dark:bg-dark-secondary dark:text-gray-200";

export const dataGridSxStyles = (isDarkMode: boolean) => {
  return {
    "& .MuiDataGrid-columnHeaders": {
      color: `${isDarkMode ? "#e5e7eb" : ""}`,
      '& [role="row"] > *': {
        backgroundColor: `${isDarkMode ? "#1d1f21" : "white"}`,
        borderColor: `${isDarkMode ? "#2d3135" : ""}`,
      },
    },
    "& .MuiIconbutton-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-root": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiTablePagination-selectIcon": {
      color: `${isDarkMode ? "#a3a3a3" : ""}`,
    },
    "& .MuiDataGrid-cell": {
      border: "none",
    },
    "& .MuiDataGrid-row": {
      borderBottom: `1px solid ${isDarkMode ? "#2d3135" : "e5e7eb"}`,
    },
    "& .MuiDataGrid-withBorderColor": {
      borderColor: `${isDarkMode ? "#2d3135" : "e5e7eb"}`,
    },
  };
};

export function groupAssetsByProjectAndDepartment(
  borrowedAssets: BorrowedAsset[] = [],
  assetRequests: AssetRequest[] = [],
) {
  const grouped: {
    [projectId: string]: {
      title: string;
      departments: {
        [departmentId: string]: {
          name: string;
          assets: BorrowedAsset[];
        };
      };
    };
  } = {};

  const taskIdToRequestMap = new Map(
    assetRequests.filter((r) => r.task?.taskID).map((r) => [r.task!.taskID, r]),
  );

  for (const asset of borrowedAssets) {
    const request = taskIdToRequestMap.get(asset.taskID);

    const projectId = request?.projectInfo?.projectID ?? "unknown_project";
    const projectTitle = request?.projectInfo?.title ?? "Unknown Project";
    const departmentId =
      request?.requesterInfo?.department?.id ?? "unknown_department";
    const departmentName =
      request?.requesterInfo?.department?.name ?? "Unknown Department";

    if (!grouped[projectId]) {
      grouped[projectId] = {
        title: projectTitle,
        departments: {},
      };
    }

    if (!grouped[projectId].departments[departmentId]) {
      grouped[projectId].departments[departmentId] = {
        name: departmentName,
        assets: [],
      };
    }

    grouped[projectId].departments[departmentId].assets.push(asset);
  }

  return grouped;
}

export const buildRequestedQuantitiesFromCheckResult = (
  result: CheckAvailabilityResult | undefined,
): Record<string, number> => {
  const quantities: Record<string, number> = {};
  if (!result) return quantities;

  result.availableAssets?.forEach((asset) => {
    const catId = asset.category?.categoryID;
    if (!catId) return;
    quantities[catId] = (quantities[catId] || 0) + 1;
  });

  const missingCats = Array.isArray(result.missingCategories)
    ? result.missingCategories
    : [];

  missingCats.forEach((cat) => {
    if (!quantities[cat.categoryId]) {
      quantities[cat.categoryId] = cat.requestedQuantity;
    }
  });

  return quantities;
};
