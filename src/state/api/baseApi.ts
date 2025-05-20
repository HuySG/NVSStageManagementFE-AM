import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).global?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Projects",
    "Tasks",
    "Users",
    "ProjectTasks",
    "AssetRequests",
    "Milestones",
    "Comments",
    "AssetTypes",
    "Assets",
    "Attachments",
    "BorrowedAssets",
    "ReturnAssets",
    "Allocation",
    "ReturnRequest",
  ],
  endpoints: () => ({}),
});
