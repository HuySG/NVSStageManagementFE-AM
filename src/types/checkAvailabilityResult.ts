import { Asset } from "./asset";

export interface MissingCategoryInfo {
  categoryId: string;
  categoryName: string;
  requestedQuantity: number;
  availableNow: number;
  shortage: number;
  nextAvailableTime?: string | null;
}

export interface CheckAvailabilityResult {
  available: boolean;
  message: string;
  availableAssets?: Asset[];
  missingCategories?:
    | MissingCategoryInfo[]
    | Record<string, MissingCategoryInfo>; // BE có thể trả array hoặc object
}
