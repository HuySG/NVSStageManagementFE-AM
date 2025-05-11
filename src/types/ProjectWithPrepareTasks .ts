import { PrepareTask } from "./PrepareTask ";

export interface ProjectWithPrepareTasks {
  projectId: string;
  projectTitle: string;
  prepareTasks: PrepareTask[];
}
