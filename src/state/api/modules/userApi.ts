import { User } from "@/types/user";
import { baseApi } from "../baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    loginUser: build.mutation<
      { result: { token: string; authenticated: boolean; user: User } }, // Thêm user vào response
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "auth/token",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Users"],
    }),

    getUserInfo: build.query<User, void>({
      query: () => "user/my-info",
      transformResponse: (response: { code: number; result: User }) =>
        response.result,
      providesTags: ["Users"],
    }),

    getUsers: build.query<User[], void>({
      query: () => "user/get-all",
      transformResponse: (response: { result: User[] }) => response.result, // Chỉ lấy result
      providesTags: ["Users"],
    }),
    getUserById: build.query<User, string>({
      query: (userId) => `user/${userId}`,
      transformResponse: (response: { code: number; result: User }) =>
        response.result,
      providesTags: ["Users"],
    }),
    getUserByDepartment: build.query<User[], string>({
      query: (departmentId) => `user/department?Id=${departmentId}`,
      providesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const {
  //loginUser
  useLoginUserMutation,
  //getUserInfo
  useGetUserInfoQuery,
  //getUsers
  useGetUsersQuery,
  //getUserById
  useGetUserByIdQuery,
  //getUserByDepartment
  useGetUserByDepartmentQuery,
} = userApi;
