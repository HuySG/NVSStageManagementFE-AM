import { baseApi } from "../baseApi";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotificationsByUser: build.query<Notification[], string>({
      query: (userId: string) => `/notifications/user/${userId}`,
      providesTags: ["Notification"],
    }),
  }),
  overrideExisting: false,
});
export const { useGetNotificationsByUserQuery } = notificationApi;
