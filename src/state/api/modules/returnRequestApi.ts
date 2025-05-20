import { ProcessReturnRequestBody, ReturnRequest } from "@/types/ReturnRequest";
import { baseApi } from "../baseApi";

export const returnRequestApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getPendingReturnRequests: build.query<ReturnRequest[], void>({
      query: () => `return-requests/pending`,
      transformResponse: (response: any) => response.result, // vì response nằm trong `result`
      providesTags: ["ReturnRequest"],
    }),
    processReturnRequest: build.mutation<
      void, // hoặc trả về kiểu nào đó nếu backend trả JSON
      {
        requestId: string;
        leaderId: string;
        data: ProcessReturnRequestBody;
      }
    >({
      query: ({ requestId, leaderId, data }) => ({
        url: `return-requests/${requestId}/process?leaderId=${leaderId}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ReturnRequest"], // nếu bạn dùng caching
    }),
    getReturnRequestById: build.query<ReturnRequest, string>({
      query: (id) => `return-requests/${id}`,
      transformResponse: (response: { result: ReturnRequest }) =>
        response.result,
      providesTags: ["ReturnRequest"],
    }),
  }),
  overrideExisting: false,
});
export const {
  useGetPendingReturnRequestsQuery,
  useProcessReturnRequestMutation,
  useGetReturnRequestByIdQuery,
} = returnRequestApi;
