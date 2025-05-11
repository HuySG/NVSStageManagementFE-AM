import { AssigneeInfo } from "./assigneeInfo";

export interface PrepareTask {
  taskID: string;
  title: string;
  description: string;
  priority: string;
  tag: string;
  startDate: string;
  endDate: string;
  status: string;
  assigneeID: string;
  assigneeInfo: AssigneeInfo;
  createBy: string;
  createDate: string;
  updateBy: string;
  updateDate: string;
  attachments: any[];
  watchers: any[] | null;
  milestoneId: string | null;
}
