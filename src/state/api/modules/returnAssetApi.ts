import { ReturnedAsset } from "@/types/returnedAsset";
import { baseApi } from "../baseApi";

export const returnAssetApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReturnAssets: build.query<ReturnedAsset[], void>({
      query: () => ({ url: `returns`, providesTags: ["ReturnAssets"] }),
    }),
  }),
  overrideExisting: false,
});
export const {
  //getReturnAssets
  useGetReturnAssetsQuery,
} = returnAssetApi;
