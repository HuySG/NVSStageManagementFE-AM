import { AssetRequest } from "@/types/assetRequest";
import { BorrowedAsset } from "@/types/borrowedAsset";

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

  borrowedAssets.forEach((asset) => {
    const request = assetRequests.find((r) => r.task?.taskID === asset.taskID);
    const projectId = request?.projectInfo?.projectID ?? "unknown";
    const projectTitle = request?.projectInfo?.title ?? "Unknown Project";
    const departmentId = request?.requesterInfo?.department?.id ?? "unknown";
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
  });

  return grouped;
}
