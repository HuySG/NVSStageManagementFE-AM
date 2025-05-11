import { Asset } from "./asset";
import { CategoryRequestItem } from "./categoryRequestItem";
import { Project } from "./project";
import { RequesterInfo } from "./requesterInfo";
import { Task } from "./task";

export interface AssetRequest {
  requestId: string;
  title: string;
  quantity: number;
  description: string;
  startTime: string;
  endTime: string;
  asset: Asset | null; // Một yêu cầu chỉ liên quan đến một tài sản
  categories?: CategoryRequestItem[];
  task: Task;
  status: string;
  requesterInfo: RequesterInfo | null;
  projectInfo: Project;
  approvedByAMName: string;
  approvedByAMTime: string;
  approvedByDLName: string;
  approvedByDLTime: string;
}
