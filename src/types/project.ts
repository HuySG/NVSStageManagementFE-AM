import { Task } from "./task";

export interface Project {
  projectId: string;
  projectID: string;
  projectTitle: string;
  title: string;
  description: string;
  startTime: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
  endTime: string;
  department: string;
  createdBy: string;
  tasks: Task[];
  taskID: string;
}
