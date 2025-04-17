import { AssetCategory } from "./assetCategory";

export interface AssetType {
  id: string;
  name: string;
  categories: AssetCategory; // Một kiểu tài sản chỉ thuộc một loại tài sản
}
