import { Task } from "@/types/task";
import { baseApi } from "../baseApi";

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
} = taskApi;
