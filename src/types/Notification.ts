export type NotificationType =
  | "OVERDUE"
  | "AUTO_CANCELLED"
  | "INFO"
  | "WARNING"
  | "SYSTEM"
  | "ASSET_OVERDUE"
  | "TASK_ASSIGNED"
  | "REQUEST_REJECTED"
  | "RETURN_REQUEST"
  | "RETURN_APPROVED"
  | "RETURN_REJECTED"
  | "ALLOCATION_REQUEST"
  | "ALLOCATION_APPROVED"
  | "ALLOCATION_REJECTED"
  | "ALLOCATION_CANCELLED"
  | "ALLOCATION_COMPLETED"
  | "ALLOCATION_FAILED"
  | "ALLOCATION_PREPARING"
  | "ALLOCATION_READY_TO_DELIVER";

export interface Notification {
  notificationID: string;
  userId: string;
  message: string;
  createDate: string;
  type: NotificationType;
  isRead: boolean;
}
