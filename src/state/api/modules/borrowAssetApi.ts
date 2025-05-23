import { BorrowedAsset } from "@/types/borrowedAsset";
import { baseApi } from "../baseApi";

export const borrowAssetsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBorrowedAssets: build.query<BorrowedAsset[], void>({
      query: () => "borrowed-assets",
      transformResponse: (response: {
        code: number;
        message: string;
        result: BorrowedAsset[];
      }) => {
        return response.result;
      },
      providesTags: ["BorrowedAssets"],
    }),

    getBorrowedAssetById: build.query<BorrowedAsset, string>({
      query: (borrowedId) =>
        `borrowed-assets/borrowedId?borrowedId=${borrowedId}`,
      providesTags: (result, error, borrowedId) => [
        { type: "BorrowedAssets", id: borrowedId },
      ],
    }),

    createBorrowedAsset: build.mutation<BorrowedAsset, Partial<BorrowedAsset>>({
      query: (data) => ({
        url: "borrowed-asset/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["BorrowedAssets"],
    }),

    deleteBorrowedAsset: build.mutation<void, string>({
      query: (borrowedId) => ({
        url: `borrowed-asset/borrowedId`,
        method: "DELETE",
        params: { borrowedId },
      }),
      invalidatesTags: ["BorrowedAssets"],
    }),
  }),
  overrideExisting: false,
});
export const {
  //getBorrowedAssets
  useGetBorrowedAssetsQuery,
  //getBorrowedAssetById
  useGetBorrowedAssetByIdQuery,
  //createBorrowedAsset
  useCreateBorrowedAssetMutation,
  //deleteBorrowedAsset
  useDeleteBorrowedAssetMutation,
} = borrowAssetsApi;
