export interface BorrowedAsset {
  borrowedID: string;
  assetID: string;
  taskID: string;
  borrowTime: string;
  endTime: string;
  description: string;
  status: string;
  requestId: string;
}
export interface StaffBorrowedAsset {
  borrowedID: string;
  assetId: string;
  assetName: string;
  taskId: string;
  taskTitle: string;
  borrowTime: string;
  startTime: string;
  endTime: string;
  status: "IN_USE" | "OVERDUE";
  projectId: string;
}
