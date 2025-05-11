import { AssetRequest } from "@/types/assetRequest";
import { baseApi } from "../baseApi";
import { CheckAvailabilityResult } from "@/types/checkAvailabilityResult";
import { Asset } from "@/types/asset";
import { AllocateAsset } from "@/types/AllocateAsset";

export const requestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getRequestAssets: build.query<AssetRequest[], void>({
      query: () => "request-asset",
      providesTags: ["AssetRequests"],
    }),

    createAssetRequest: build.mutation<AssetRequest, Partial<AssetRequest>>({
      query: (assetRequest) => ({
        url: "request-asset",
        method: "POST",
        body: [assetRequest],
      }),
      invalidatesTags: ["AssetRequests"], // Xóa cache để cập nhật dữ liệu mới
    }),

    getRequestAssetByDepartment: build.query<AssetRequest[], string>({
      query: (departmentId) => ({
        url: `request-asset/leader/department?Id=${departmentId}`,
        method: "GET",
      }),
      providesTags: ["AssetRequests"],
    }),
    getAssetRequestsForManager: build.query<AssetRequest[], void>({
      query: () => "request-asset/asset-manager",
      providesTags: ["AssetRequests"],
    }),
    updateAssetStatus: build.mutation<
      void,
      { requestId: string; status: string; approverId: string }
    >({
      query: ({ requestId, status, approverId }) => ({
        url: "request-asset/status",
        method: "PUT",
        body: { requestId, status, approverId },
      }),
      invalidatesTags: ["AssetRequests"],
    }),
    acceptBookingRequest: build.mutation<
      AssetRequest,
      { requestId: string; userId: string }
    >({
      query: ({ requestId, userId }) => ({
        url: `request-asset/${requestId}/${userId}/accept-booking`,
        method: "PUT",
      }),
      invalidatesTags: ["AssetRequests"],
    }),

    acceptAssetRequest: build.mutation<AssetRequest, string>({
      query: (requestId) => ({
        url: `request-asset/${requestId}/accept`,
        method: "PUT",
      }),
      invalidatesTags: ["AssetRequests"],
    }),
    getCheckAvailabilityResult: build.query<CheckAvailabilityResult, string>({
      query: (requestId) => `request-asset/${requestId}/check-availability`,

      providesTags: ["AssetRequests"],
    }),

    allocateAssets: build.mutation<
      void,
      { requestId: string; allocations: AllocateAsset[] }
    >({
      query: ({ requestId, allocations }) => ({
        url: `request-asset/allocate-assets`,
        method: "POST",
        params: { requestId },
        body: allocations,
      }),
      invalidatesTags: ["AssetRequests"],
    }),

    getAllocatedAssets: build.query<Asset[], string>({
      query: (requestId) => `request-asset/${requestId}/allocated-assets`,
      providesTags: ["AssetRequests"],
    }),
    getRequestByTaskId: build.query<AssetRequest, string>({
      query: (taskId) => `request-asset/by-task/${taskId}`,
      transformResponse: (res: AssetRequest[]) => res[0], // lấy phần tử đầu tiên
      providesTags: ["AssetRequests"],
    }),
    uploadBeforeImages: build.mutation<
      void,
      { allocationId: string; imageUrls: string[] }
    >({
      query: ({ allocationId, imageUrls }) => ({
        url: `request-asset/${allocationId}/upload-before-image`,
        method: "POST",
        body: { imageUrls },
      }),
      invalidatesTags: ["Allocation"],
    }),
  }),
  overrideExisting: false,
});
export const {
  //getRequestAssets
  useGetRequestAssetsQuery,
  //createAssetRequest
  useCreateAssetRequestMutation,
  //getRequestAssetByDepartment
  useGetRequestAssetByDepartmentQuery,
  //getAssetRequestsForManager
  useGetAssetRequestsForManagerQuery,
  //updateAssetStatus
  useUpdateAssetStatusMutation,
  //acceptBookingRequest
  useAcceptBookingRequestMutation,
  //acceptAssetRequest
  useAcceptAssetRequestMutation,
  //getCheckAvailabilityResult
  useGetCheckAvailabilityResultQuery,
  //allocateAssets
  useAllocateAssetsMutation,
  //getAllocatedAssets
  useGetAllocatedAssetsQuery,
  //getRequestByTaskId
  useGetRequestByTaskIdQuery,
  //uploadBeforeImages
  useUploadBeforeImagesMutation,
} = requestApi;
