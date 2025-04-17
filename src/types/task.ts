import { AssigneeInfo } from "./assigneeInfo";
import { Attachment } from "./attachment";
import { Milestone } from "./milestone";
import { Project } from "./project";
import { TaskUser } from "./taskUser";
import { Watcher } from "./watcher";

export interface Task {
  taskID: string;
  title: string;
  description: string;
  priority: string;
  tag: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  assigneeID: string;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
  attachments?: Attachment[];
  assigneeInfo?: AssigneeInfo;
  watchers?: Watcher[];
  projectID?: Project;
  milestoneId: Milestone;
  comments?: Comment[];
  TaskUser?: TaskUser[];
}
