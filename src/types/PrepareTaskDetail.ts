import { AssetRequest } from "./assetRequest";
import { PrepareTask } from "./PrepareTask ";
import { Task } from "./task";

export interface PrepareTaskDetail {
  prepareTask: PrepareTask;
  requestTask: Task;
  request: AssetRequest[];
  assets: AssetPreparation[];
}

export interface AssetPreparation {
  allocationId: string;
  assetId: string;
  assetName: string;
  categoryId: string;
  categoryName: string;
  requestId: string;
  requestTitle: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  conditionBefore: string | null;
  imageUrls: string[] | null;
}
