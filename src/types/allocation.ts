export interface AssetUsageHistory {
  usageID: string;
  startDate: string;
  endDate: string;
  status: string;
  projectID: string;
  projectName: string;
}

export interface Allocation {
  allocationId: string;
  categoryID: string;
  categoryName: string;
  assetID: string;
  assetName: string;
  usageHistory: AssetUsageHistory[];
}
