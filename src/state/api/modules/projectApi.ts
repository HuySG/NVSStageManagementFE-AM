import { Project } from "@/types/project";
import { baseApi } from "../baseApi";
import { ProjectWithPrepareTasks } from "@/types/ProjectWithPrepareTasks ";

export const projectApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProjects: build.query<Project[], void>({
      query: () => "project",
      providesTags: ["Projects"],
    }),
    getProjectsDepartment: build.query<Project[], string>({
      query: (departmentId) => `project/department?Id=${departmentId}`,
      providesTags: ["Projects"],
    }),
    getProjectsByUserId: build.query<Project[], string>({
      query: (userId) => `project/userId?userId=${userId}`,
      providesTags: ["Projects"],
    }),

    getProjectDetailsById: build.query<Project, string>({
      query: (projectId) => `/project/${projectId}/details`,
      providesTags: ["Projects"],
    }),
    getProjectAMByDepartmentId: build.query<Project[], string>({
      query: (deptId) => `/tasks/departments/${deptId}/prepare-projects`,
      providesTags: ["Projects"],
    }),
    getPrepareProjectsByAssignee: build.query<
      ProjectWithPrepareTasks[],
      string
    >({
      query: (assigneeId) => `tasks/assignees/${assigneeId}/prepare-projects`,
      providesTags: ["Projects"],
    }),
  }),
  overrideExisting: false,
});

export const {
  //getProjects
  useGetProjectsQuery,
  //getProjectsDepartment
  useGetProjectsDepartmentQuery,
  //getProjectsByUserId
  useGetProjectsByUserIdQuery,
  //getProjectDetailsById
  useGetProjectDetailsByIdQuery,
  //getProjectAMByDepartmentId
  useGetProjectAMByDepartmentIdQuery,
  //getPrepareProjectsByAssignee
  useGetPrepareProjectsByAssigneeQuery,
} = projectApi;
