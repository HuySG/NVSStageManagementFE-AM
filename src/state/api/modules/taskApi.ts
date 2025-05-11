import { Task } from "@/types/task";
import { baseApi } from "../baseApi";
import { PrepareTaskDetail } from "@/types/PrepareTaskDetail";

export const taskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTaskMilestone: build.query<Task[], { projectID: string }>({
      query: ({ projectID }) => `tasks/milestoneId?milestoneId=${projectID}`,
      providesTags: (result) =>
        result
          ? result.map(({ taskID }) => ({ type: "Tasks" as const, id: taskID }))
          : [{ type: "Tasks" as const }],
    }),

    getTasksByUser: build.query<Task[], string>({
      query: (userId) => `tasks/by-user/${userId}`,
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ taskID }) => ({ type: "Tasks", id: taskID }))
          : [{ type: "Tasks", id: userId }],
    }),

    createTask: build.mutation<Task, Partial<Task>>({
      query: (task) => ({
        url: "tasks",
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: string; status: string }>({
      query: ({ taskId, status }) => ({
        url: `tasks/${taskId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    updateTask: build.mutation<Task, Partial<Task>>({
      query: (taskData) => ({
        url: "tasks",
        method: "PUT",
        body: taskData, // Gửi toàn bộ dữ liệu cập nhật
      }),
      invalidatesTags: (result, error, { taskID }) => [
        { type: "Tasks", id: taskID },
      ],
    }),
    getTaskById: build.query<Task, string>({
      query: (taskId) => `tasks/taskId?taskId=${taskId}`,
      providesTags: ["Tasks"],
    }),
    getTasksByProjectId: build.query<Task[], string>({
      query: (projectId) => `tasks/by-project/${projectId}`,
      providesTags: ["Tasks"],
    }),
    getTasksByDepartment: build.query<Task[], string>({
      query: (departmentId) => `tasks/department/${departmentId}`,
      providesTags: ["Tasks"],
    }),
    createPreparationTask: build.mutation<
      Task,
      { requestId: string; createBy: string }
    >({
      query: ({ requestId, createBy }) => ({
        url: `tasks/request/${requestId}/prepare-task`,
        method: "POST",
        params: { createBy },
      }),
      invalidatesTags: ["Tasks"],
    }),
    getPrepareTasksByProjectId: build.query<Task[], string>({
      query: (projectId) => `tasks/prepare/by-project/${projectId}`,
      providesTags: ["Tasks"],
    }),
    deleteTask: build.mutation<{ success: boolean }, string>({
      query: (taskId) => ({
        url: `tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, taskId) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getPreparationDetails: build.query<PrepareTaskDetail, string>({
      query: (prepareTaskId) => `tasks/${prepareTaskId}/preparation-details`,
      providesTags: ["Tasks"],
    }),
  }),
  overrideExisting: false,
});
export const {
  //getTaskMilestone
  useGetTaskMilestoneQuery,
  //getTasksByUser
  useGetTasksByUserQuery,
  //createTask
  useCreateTaskMutation,
  //updateTaskStatus
  useUpdateTaskStatusMutation,
  //updateTask
  useUpdateTaskMutation,
  //getTaskById
  useGetTaskByIdQuery,
  //getTasksByProjectId
  useGetTasksByProjectIdQuery,
  //getTasksByDepartment
  useGetTasksByDepartmentQuery,
  //createPreparationTask
  useCreatePreparationTaskMutation,
  //getPrepareTasksByProjectId
  useGetPrepareTasksByProjectIdQuery,
  //deleteTask
  useDeleteTaskMutation,
  //getPreparationDetails
  useGetPreparationDetailsQuery,
} = taskApi;
