import { Allocation, AssetUsageHistory } from "@/types/allocation";
import { baseApi } from "../baseApi";

export const allocationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllocationsByRequestId: build.query<Allocation[], string>({
      query: (requestId) => `/requests/category/${requestId}/allocations`,
      providesTags: ["Allocation"],
    }),
    getUsageHistoryByAsset: build.query<AssetUsageHistory[], string>({
      query: (assetId) => `/asset/${assetId}/usage-history`,
      providesTags: ["Allocation"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllocationsByRequestIdQuery,
  useGetUsageHistoryByAssetQuery,
} = allocationApi;
