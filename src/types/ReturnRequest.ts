export interface ReturnRequest {
  requestId: string;
  assetId: string;
  taskId: string;
  staffId: string;
  description: string | null;
  conditionNote: string;
  imageUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestTime: string;
  rejectReason: string | null;
  processedTime: string | null;
}

export interface ProcessReturnRequestBody {
  approved: boolean;
  leaderNote: string;
  damageFee?: number;
  rejectReason?: string;
}
