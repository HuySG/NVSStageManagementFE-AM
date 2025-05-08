import { Asset } from "@/types/asset";
import { baseApi } from "../baseApi";
import { AssetType } from "@/types/assetType";

export const assetApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAssets: build.query<Asset[], void>({
      query: () => ({
        url: "asset",
        method: "GET",
      }),
      providesTags: ["Assets"],
    }),
    getAssetTypes: build.query<AssetType[], void>({
      query: () => ({
        url: "asset-types",
        method: "GET",
      }),
      providesTags: ["AssetTypes"],
    }),
    getAssetById: build.query<Asset, string>({
      query: (id) => `/asset/${id}`,
    }),
  }),
  overrideExisting: false,
});
export const {
  //getAssets
  useGetAssetsQuery,
  //getAssetTypes
  useGetAssetTypesQuery,
  //getAssetById
  useGetAssetByIdQuery,
} = assetApi;
