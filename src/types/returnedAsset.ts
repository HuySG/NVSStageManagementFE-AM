export interface ReturnedAsset {
  returnedAssetID: string;
  taskID: string | null;
  assetID: string | null;
  returnTime: string | null;
  description: string | null;
  milestoneName?: string | null;
  projectID?: string | null;
  title?: string | null;
}
